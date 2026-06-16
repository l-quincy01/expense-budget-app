using StackExchange.Redis;

namespace BudgetlyAI.Services.Health;

public sealed class RedisDependencyHealthCheck : IDependencyHealthCheck
{
    private readonly IConfiguration _configuration;

    public RedisDependencyHealthCheck(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Name => "redis";

    public async Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default)
    {
        try
        {
            var connectionString = _configuration["Redis:ConnectionString"] ?? "localhost:6379";
            await using var connection = await ConnectionMultiplexer.ConnectAsync(connectionString);
            var latency = await connection.GetDatabase().PingAsync();
            return Result(true, $"PING {latency.TotalMilliseconds:0}ms");
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
