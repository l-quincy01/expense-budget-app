using BudgetlyAI.Contracts.Statements;
using BudgetlyAI.Data;
using BudgetlyAI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Services.Statements;

public sealed class StatementService : IStatementService
{
    private readonly BudgetsDbContext _context;
    private readonly IStatementFileStorage _fileStorage;
    private readonly IStatementEventPublisher _eventPublisher;
    private readonly ILogger<StatementService> _logger;

    public StatementService(
        BudgetsDbContext context,
        IStatementFileStorage fileStorage,
        IStatementEventPublisher eventPublisher,
        ILogger<StatementService> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<StatementUploadResponseDto> UploadAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dashboardName))
        {
            throw new ArgumentException("dashboardName is required", nameof(dashboardName));
        }

        if (pdfs.Length == 0)
        {
            throw new ArgumentException("At least one PDF is required", nameof(pdfs));
        }

        var uploads = new List<StatementUpload>();

        try
        {
            foreach (var pdf in pdfs)
            {
                var statementId = Guid.NewGuid();
                var storedFilePath = await _fileStorage.SaveAsync(userId, statementId, pdf, ct);

                uploads.Add(new StatementUpload
                {
                    Id = statementId,
                    UserId = userId,
                    DashboardName = dashboardName,
                    FileName = pdf.FileName,
                    StoredFilePath = storedFilePath,
                    Status = StatementStatus.Uploaded,
                    UploadedAt = DateTime.UtcNow,
                    RetryCount = 0
                });
            }

            _context.StatementUploads.AddRange(uploads);
            await _context.SaveChangesAsync(ct);

            foreach (var upload in uploads)
            {
                upload.Status = StatementStatus.Queued;
            }

            await _context.SaveChangesAsync(ct);

            foreach (var upload in uploads)
            {
                await _eventPublisher.PublishAsync(
                    new StatementUploaded(
                        upload.Id,
                        upload.UserId,
                        upload.DashboardName,
                        upload.FileName,
                        upload.StoredFilePath,
                        upload.UploadedAt),
                    ct);
            }

            return new StatementUploadResponseDto(
                uploads.Select(ToUploadResult).ToList());
        }
        catch
        {
            await RollBackCreatedUploadsAsync(uploads, ct);
            throw;
        }
    }

    public async Task<IReadOnlyList<StatementStatusResponseDto>> ListAsync(
        string userId,
        CancellationToken ct = default)
    {
        return await _context.StatementUploads
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UploadedAt)
            .ThenByDescending(s => s.Id)
            .Select(s => ToStatusResponse(s))
            .ToListAsync(ct);
    }

    public async Task<StatementStatusResponseDto?> GetStatusAsync(
        string userId,
        Guid statementId,
        CancellationToken ct = default)
    {
        return await _context.StatementUploads
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.Id == statementId)
            .Select(s => ToStatusResponse(s))
            .FirstOrDefaultAsync(ct);
    }

    private async Task RollBackCreatedUploadsAsync(
        IReadOnlyList<StatementUpload> uploads,
        CancellationToken ct)
    {
        foreach (var upload in uploads)
        {
            await _fileStorage.DeleteIfExistsAsync(upload.StoredFilePath, ct);
        }

        var ids = uploads.Select(u => u.Id).ToArray();
        if (ids.Length == 0)
        {
            return;
        }

        var persisted = await _context.StatementUploads
            .Where(s => ids.Contains(s.Id))
            .ToListAsync(ct);

        if (persisted.Count > 0)
        {
            _context.StatementUploads.RemoveRange(persisted);
            await _context.SaveChangesAsync(ct);
        }

        _logger.LogWarning(
            "[StatementService] Rolled back {Count} statement upload(s) after upload failure",
            uploads.Count);
    }

    private static StatementUploadResultDto ToUploadResult(StatementUpload upload)
    {
        return new StatementUploadResultDto(
            upload.Id,
            upload.FileName,
            upload.Status,
            upload.UploadedAt);
    }

    private static StatementStatusResponseDto ToStatusResponse(StatementUpload upload)
    {
        return new StatementStatusResponseDto(
            upload.Id,
            upload.DashboardName,
            upload.FileName,
            upload.Status,
            upload.ErrorMessage,
            upload.UploadedAt,
            upload.ProcessedAt,
            upload.RetryCount);
    }
}
