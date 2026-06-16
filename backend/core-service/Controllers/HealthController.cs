using BudgetlyAI.Services.Health;
using Microsoft.AspNetCore.Mvc;

namespace BudgetlyAI.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    private readonly IEnumerable<IDependencyHealthCheck> _checks;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        IEnumerable<IDependencyHealthCheck> checks,
        ILogger<HealthController> logger)
    {
        _checks = checks;
        _logger = logger;
    }

    [HttpGet("/api/health")]
    [HttpGet("/health")]
    public async Task<IActionResult> GetOverallHealth(CancellationToken ct)
    {
        _logger.LogInformation("[HealthCheck] Incoming overall health check request");

        var results = await Task.WhenAll(_checks.Select(check => check.CheckAsync(ct)));
        var healthy = results.All(result => result.IsHealthy);
        var response = new
        {
            name = "overall",
            status = healthy ? HealthStatuses.Healthy : HealthStatuses.Unhealthy,
            checkedAt = DateTimeOffset.UtcNow,
            dependencies = results
        };

        return StatusCode(healthy ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable, response);
    }

    [HttpGet("/health/db")]
    public Task<IActionResult> GetDbHealth(CancellationToken ct)
    {
        return GetDependencyHealth("db", ct);
    }

    [HttpGet("/health/redis")]
    public Task<IActionResult> GetRedisHealth(CancellationToken ct)
    {
        return GetDependencyHealth("redis", ct);
    }

    [HttpGet("/health/rabbitmq")]
    public Task<IActionResult> GetRabbitMqHealth(CancellationToken ct)
    {
        return GetDependencyHealth("rabbitmq", ct);
    }

    [HttpGet("/health/elasticsearch")]
    public Task<IActionResult> GetElasticsearchHealth(CancellationToken ct)
    {
        return GetDependencyHealth("elasticsearch", ct);
    }

    [HttpGet("/health/ai-service")]
    public Task<IActionResult> GetAiServiceHealth(CancellationToken ct)
    {
        return GetDependencyHealth("ai-service", ct);
    }

    private async Task<IActionResult> GetDependencyHealth(string name, CancellationToken ct)
    {
        var check = _checks.FirstOrDefault(candidate => candidate.Name == name);
        if (check is null)
        {
            return NotFound(new
            {
                name,
                status = HealthStatuses.Unhealthy,
                checkedAt = DateTimeOffset.UtcNow,
                detail = "Health check is not registered"
            });
        }

        var result = await check.CheckAsync(ct);
        return StatusCode(
            result.IsHealthy ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable,
            result);
    }
}
