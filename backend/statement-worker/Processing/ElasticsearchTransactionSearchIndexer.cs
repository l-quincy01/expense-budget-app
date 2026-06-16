using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using StatementWorker.Data;

namespace StatementWorker.Processing;

public sealed class ElasticsearchTransactionSearchIndexer : ITransactionSearchIndexer
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ElasticsearchTransactionSearchIndexer> _logger;
    private bool _indexChecked;

    public ElasticsearchTransactionSearchIndexer(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ElasticsearchTransactionSearchIndexer> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task IndexAsync(
        IReadOnlyCollection<ExtractedTransactionRecord> transactions,
        CancellationToken ct = default)
    {
        if (transactions.Count == 0)
        {
            return;
        }

        await EnsureIndexAsync(ct);

        foreach (var transaction in transactions)
        {
            var document = new
            {
                id = transaction.Id,
                statementId = transaction.StatementUploadId,
                userId = transaction.UserId,
                dashboardName = transaction.DashboardName,
                description = transaction.Description,
                merchant = transaction.Merchant,
                category = transaction.Category,
                amount = transaction.Amount,
                date = transaction.Date.ToString("yyyy-MM-dd"),
                transactionType = transaction.TransactionType
            };

            var request = CreateRequest(
                HttpMethod.Put,
                $"{GetIndexName()}/_doc/{transaction.Id}",
                document);

            using var response = await _httpClient.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();
        }

        _logger.LogInformation(
            "[ElasticsearchTransactionSearchIndexer] Indexed {Count} transaction(s)",
            transactions.Count);
    }

    private async Task EnsureIndexAsync(CancellationToken ct)
    {
        if (_indexChecked)
        {
            return;
        }

        using var existsRequest = CreateRequest(HttpMethod.Head, GetIndexName());
        using var existsResponse = await _httpClient.SendAsync(existsRequest, ct);
        if (existsResponse.IsSuccessStatusCode)
        {
            _indexChecked = true;
            return;
        }

        if (existsResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            existsResponse.EnsureSuccessStatusCode();
        }

        var mapping = new
        {
            mappings = new
            {
                properties = new Dictionary<string, object?>
                {
                    ["id"] = new { type = "keyword" },
                    ["statementId"] = new { type = "keyword" },
                    ["userId"] = new { type = "keyword" },
                    ["dashboardName"] = new { type = "keyword" },
                    ["description"] = new { type = "text" },
                    ["merchant"] = new { type = "text", fields = new { keyword = new { type = "keyword" } } },
                    ["category"] = new { type = "keyword" },
                    ["amount"] = new { type = "double" },
                    ["date"] = new { type = "date" },
                    ["transactionType"] = new { type = "keyword" }
                }
            }
        };

        var request = CreateRequest(HttpMethod.Put, GetIndexName(), mapping);
        using var response = await _httpClient.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        _indexChecked = true;
    }

    private HttpRequestMessage CreateRequest(
        HttpMethod method,
        string relativePath,
        object? body = null)
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

        if (body is not null)
        {
            request.Content = new StringContent(
                JsonSerializer.Serialize(body, JsonOptions),
                Encoding.UTF8,
                "application/json");
        }

        return request;
    }

    private string GetIndexName()
    {
        return _configuration["Elasticsearch:TransactionIndexName"] ?? "budgetly-transactions";
    }
}
