using RabbitMQ.Client;

namespace BudgetlyAI.Services.Health;

public sealed class RabbitMqDependencyHealthCheck : IDependencyHealthCheck
{
    private readonly IConfiguration _configuration;

    public RabbitMqDependencyHealthCheck(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Name => "rabbitmq";

    public async Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default)
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMq:Host"] ?? "localhost",
                UserName = _configuration["RabbitMq:Username"] ?? "guest",
                Password = _configuration["RabbitMq:Password"] ?? ""
            };

            await using var connection = await factory.CreateConnectionAsync(ct);
            await using var channel = await connection.CreateChannelAsync(cancellationToken: ct);
            return Result(channel.IsOpen, channel.IsOpen ? null : "RabbitMQ channel is not open");
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
