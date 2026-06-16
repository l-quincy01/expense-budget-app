namespace BudgetlyAI.Services.Health;

public sealed class AiServiceDependencyHealthCheck : IDependencyHealthCheck
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AiServiceDependencyHealthCheck(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public string Name => "ai-service";

    public async Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default)
    {
        try
        {
            var url = _configuration["AiService:HealthUrl"] ?? "http://localhost:4010/api/health";
            using var response = await _httpClient.GetAsync(url, ct);
            return Result(
                response.IsSuccessStatusCode,
                response.IsSuccessStatusCode
                    ? null
                    : $"HTTP {(int)response.StatusCode}");
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
