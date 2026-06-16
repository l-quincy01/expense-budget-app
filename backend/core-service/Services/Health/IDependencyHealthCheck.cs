namespace BudgetlyAI.Services.Health;

public interface IDependencyHealthCheck
{
    string Name { get; }
    Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default);
}
