namespace BudgetlyAI.Services.Health;

public sealed record DependencyHealthResult(
    string Name,
    string Status,
    DateTimeOffset CheckedAt,
    string? Detail = null)
{
    public bool IsHealthy => Status == HealthStatuses.Healthy;
}

public static class HealthStatuses
{
    public const string Healthy = "Healthy";
    public const string Unhealthy = "Unhealthy";
}
