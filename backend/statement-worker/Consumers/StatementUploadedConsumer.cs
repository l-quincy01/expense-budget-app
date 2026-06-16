using BudgetlyAI.Contracts.Statements;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using StatementWorker.Data;

namespace StatementWorker.Consumers;

public sealed class StatementUploadedConsumer : IConsumer<StatementUploaded>
{
    private readonly StatementWorkerDbContext _context;
    private readonly ILogger<StatementUploadedConsumer> _logger;

    public StatementUploadedConsumer(
        StatementWorkerDbContext context,
        ILogger<StatementUploadedConsumer> logger)
    {
        _context = context;
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

        upload.Status = StatementStatus.Completed;
        upload.ProcessedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation(
            "[StatementWorker] Statement processing completed. statementId={StatementId}, userId={UserId}",
            upload.Id,
            upload.UserId);
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
