using BudgetlyAI.Contracts.Statements;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using StatementWorker.Data;
using StatementWorker.Extraction;
using StatementWorker.Processing;
using StatementWorker.Retry;

namespace StatementWorker.Consumers;

public sealed class StatementUploadedConsumer : IConsumer<StatementUploaded>
{
    private readonly StatementWorkerDbContext _context;
    private readonly IAiStatementExtractionClient _aiClient;
    private readonly IDashboardReadModelWriter _dashboardWriter;
    private readonly ITransactionSearchIndexer _transactionSearchIndexer;
    private readonly IDashboardCacheInvalidator _cacheInvalidator;
    private readonly IMessageRetryStatus _retryStatus;
    private readonly ILogger<StatementUploadedConsumer> _logger;

    public StatementUploadedConsumer(
        StatementWorkerDbContext context,
        IAiStatementExtractionClient aiClient,
        IDashboardReadModelWriter dashboardWriter,
        ITransactionSearchIndexer transactionSearchIndexer,
        IDashboardCacheInvalidator cacheInvalidator,
        IMessageRetryStatus retryStatus,
        ILogger<StatementUploadedConsumer> logger)
    {
        _context = context;
        _aiClient = aiClient;
        _dashboardWriter = dashboardWriter;
        _transactionSearchIndexer = transactionSearchIndexer;
        _cacheInvalidator = cacheInvalidator;
        _retryStatus = retryStatus;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<StatementUploaded> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "[StatementWorker] Received statement. statementId={StatementId}, userId={UserId}, dashboardName={DashboardName}, fileName={FileName}",
            message.StatementId,
            message.UserId,
            message.DashboardName,
            message.FileName);

        var upload = await _context.StatementUploads
            .FirstOrDefaultAsync(s => s.Id == message.StatementId, context.CancellationToken);

        if (upload is null)
        {
            _logger.LogWarning(
                "[StatementWorker] Statement metadata not found. statementId={StatementId}",
                message.StatementId);
            return;
        }

        if (!MessageMatchesUpload(message, upload))
        {
            _logger.LogWarning(
                "[StatementWorker] Statement event does not match persisted metadata. statementId={StatementId}",
                message.StatementId);
            return;
        }

        upload.Status = StatementStatus.Processing;
        upload.ErrorMessage = null;
        await _context.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation(
            "[StatementWorker] Statement processing started. statementId={StatementId}, userId={UserId}",
            upload.Id,
            upload.UserId);

        try
        {
            var extraction = await _aiClient.ExtractAsync(upload, context.CancellationToken);
            StatementExtractionValidator.Validate(extraction);

            var extractedTransactions = ExtractedTransactionMapper.Map(upload, extraction);
            var existingRows = await _context.ExtractedTransactions
                .Where(t => t.StatementUploadId == upload.Id)
                .ToListAsync(context.CancellationToken);

            if (existingRows.Count > 0)
            {
                _context.ExtractedTransactions.RemoveRange(existingRows);
            }

            _context.ExtractedTransactions.AddRange(extractedTransactions);
            await _context.SaveChangesAsync(context.CancellationToken);

            await _transactionSearchIndexer.IndexAsync(
                extractedTransactions,
                context.CancellationToken);

            await _dashboardWriter.UpsertAsync(upload, extraction, context.CancellationToken);

            upload.Status = StatementStatus.Completed;
            upload.ProcessedAt = DateTime.UtcNow;
            upload.ErrorMessage = null;
            await _context.SaveChangesAsync(context.CancellationToken);

            await _cacheInvalidator.InvalidateUserAsync(upload.UserId, context.CancellationToken);

            _logger.LogInformation(
                "[StatementWorker] Statement processing completed. statementId={StatementId}, userId={UserId}, extractedRows={ExtractedRows}",
                upload.Id,
                upload.UserId,
                extractedTransactions.Count);
        }
        catch (ExtractionValidationException ex)
        {
            await MarkTerminalStatusAsync(
                upload,
                StatementStatus.NeedsReview,
                ex.Message,
                context.CancellationToken);

            _logger.LogWarning(
                ex,
                "[StatementWorker] Statement needs review. statementId={StatementId}",
                upload.Id);
        }
        catch (Exception ex)
        {
            var retryAttempt = _retryStatus.GetRetryAttempt(context);
            var status = retryAttempt >= 3
                ? StatementStatus.Failed
                : StatementStatus.Retrying;

            await MarkTerminalStatusAsync(
                upload,
                status,
                ex.Message,
                context.CancellationToken);

            _logger.LogError(
                ex,
                "[StatementWorker] Statement processing failed. statementId={StatementId}, retryAttempt={RetryAttempt}, status={Status}",
                upload.Id,
                retryAttempt,
                status);

            throw;
        }
    }

    private async Task MarkTerminalStatusAsync(
        StatementUploadRecord upload,
        StatementStatus status,
        string errorMessage,
        CancellationToken ct)
    {
        upload.Status = status;
        upload.ErrorMessage = errorMessage;
        upload.ProcessedAt = status == StatementStatus.Retrying
            ? null
            : DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    private static bool MessageMatchesUpload(
        StatementUploaded message,
        StatementUploadRecord upload)
    {
        return upload.UserId == message.UserId &&
               upload.DashboardName == message.DashboardName &&
               upload.FileName == message.FileName &&
               upload.StoredFilePath == message.StoredFilePath;
    }
}
