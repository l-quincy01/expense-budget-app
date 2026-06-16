using System.Net.Http.Headers;
using System.Text;

namespace BudgetlyAI.Services.Health;

public sealed class ElasticsearchDependencyHealthCheck : IDependencyHealthCheck
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public ElasticsearchDependencyHealthCheck(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public string Name => "elasticsearch";

    public async Task<DependencyHealthResult> CheckAsync(CancellationToken ct = default)
    {
        try
        {
            using var request = CreateRequest(HttpMethod.Get, "/");
            using var response = await _httpClient.SendAsync(request, ct);
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

    private HttpRequestMessage CreateRequest(HttpMethod method, string relativePath)
    {
        var baseUri = _configuration["Elasticsearch:Uri"] ?? "http://localhost:9200";
        var request = new HttpRequestMessage(
            method,
            new Uri(new Uri(baseUri.TrimEnd('/') + "/"), relativePath.TrimStart('/')));

        var username = _configuration["Elasticsearch:Username"];
        var password = _configuration["Elasticsearch:Password"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", token);
        }

        return request;
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
