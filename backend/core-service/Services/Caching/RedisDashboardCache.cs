using System.Text.Json;
using StackExchange.Redis;

namespace BudgetlyAI.Services.Caching;

public sealed class RedisDashboardCache : IDashboardCache
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly ILogger<RedisDashboardCache> _logger;
    private IConnectionMultiplexer? _connection;

    public RedisDashboardCache(
        IConfiguration configuration,
        ILogger<RedisDashboardCache> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<T?> GetOrSetAsync<T>(
        string key,
        Func<Task<T?>> factory,
        CancellationToken ct = default)
    {
        try
        {
            var connection = await GetConnectionAsync();
            var db = connection.GetDatabase();
            var cached = await db.StringGetAsync(key);

            if (cached.HasValue)
            {
                _logger.LogInformation("[RedisDashboardCache] Cache hit. key={Key}", key);
                return JsonSerializer.Deserialize<T>(cached!, JsonOptions);
            }

            _logger.LogInformation("[RedisDashboardCache] Cache miss. key={Key}", key);
            var value = await factory();
            if (value is null)
            {
                return value;
            }

            var ttl = TimeSpan.FromSeconds(
                _configuration.GetValue("Redis:DefaultTtlSeconds", 300));
            await db.StringSetAsync(key, JsonSerializer.Serialize(value, JsonOptions), ttl);
            return value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "[RedisDashboardCache] Cache unavailable. Falling back to source. key={Key}",
                key);
            return await factory();
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken ct = default)
    {
        try
        {
            var connection = await GetConnectionAsync();
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
                "[RedisDashboardCache] Failed to remove cache keys. pattern={Pattern}",
                pattern);
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
