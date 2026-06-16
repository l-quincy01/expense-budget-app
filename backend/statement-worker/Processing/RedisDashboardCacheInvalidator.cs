using StackExchange.Redis;

namespace StatementWorker.Processing;

public sealed class RedisDashboardCacheInvalidator : IDashboardCacheInvalidator
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RedisDashboardCacheInvalidator> _logger;
    private IConnectionMultiplexer? _connection;

    public RedisDashboardCacheInvalidator(
        IConfiguration configuration,
        ILogger<RedisDashboardCacheInvalidator> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvalidateUserAsync(string userId, CancellationToken ct = default)
    {
        try
        {
            var connection = await GetConnectionAsync();
            var pattern = $"dashboard:{userId}:*";
            var db = connection.GetDatabase();

            foreach (var endpoint in connection.GetEndPoints())
            {
                var server = connection.GetServer(endpoint);
                await foreach (var key in server.KeysAsync(pattern: pattern).WithCancellation(ct))
                {
                    await db.KeyDeleteAsync(key);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "[RedisDashboardCacheInvalidator] Failed to invalidate dashboard cache for userId={UserId}",
                userId);
        }
    }

    private async Task<IConnectionMultiplexer> GetConnectionAsync()
    {
        if (_connection is { IsConnected: true })
        {
            return _connection;
        }

        var connectionString = _configuration["Redis:ConnectionString"] ?? "localhost:6379";
        _connection = await ConnectionMultiplexer.ConnectAsync(connectionString);
        return _connection;
    }
}
