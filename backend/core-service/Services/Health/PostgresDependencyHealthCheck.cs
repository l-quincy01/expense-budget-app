using BudgetlyAI.Data;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Services.Health;

public sealed class PostgresDependencyHealthCheck : IDependencyHealthCheck
{
    private readonly BudgetsDbContext _context;

    public PostgresDependencyHealthCheck(BudgetsDbContext context)
    {
        _context = context;
    }

    public string Name => "db";

    public async Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(ct);
            return Result(canConnect, canConnect ? null : "Cannot connect to Postgres");
        }
        catch (Exception ex)
        {
            return Result(false, ex.Message);
        }
    }

    private DependencyHealthResult Result(bool healthy, string? detail)
    {
        return new DependencyHealthResult(
            Name,
            healthy ? HealthStatuses.Healthy : HealthStatuses.Unhealthy,
            DateTimeOffset.UtcNow,
            detail);
    }
}
