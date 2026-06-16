namespace StatementWorker.Processing;

public interface IDashboardCacheInvalidator
{
    Task InvalidateUserAsync(string userId, CancellationToken ct = default);
}
