namespace BudgetlyAI.Services.Caching;

public interface IDashboardCache
{
    Task<T?> GetOrSetAsync<T>(
        string key,
        Func<Task<T?>> factory,
        CancellationToken ct = default);

    Task RemoveByPatternAsync(string pattern, CancellationToken ct = default);
}
