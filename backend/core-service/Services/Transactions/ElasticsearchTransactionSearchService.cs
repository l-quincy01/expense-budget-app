using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BudgetlyAI.Services.Transactions;

public sealed class ElasticsearchTransactionSearchService : ITransactionSearchService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public ElasticsearchTransactionSearchService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<TransactionSearchResponseDto> SearchAsync(
        string userId,
        TransactionSearchRequest request,
        CancellationToken ct = default)
    {
        var searchBody = BuildSearchBody(userId, request);
        var httpRequest = CreateRequest(
            HttpMethod.Post,
            $"{GetIndexName()}/_search",
            searchBody);

        using var response = await _httpClient.SendAsync(httpRequest, ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return new TransactionSearchResponseDto([], 0);
        }

        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

        var hits = document.RootElement
            .GetProperty("hits");
        var total = ReadTotal(hits.GetProperty("total"));
        var results = new List<TransactionSearchResultDto>();

        foreach (var hit in hits.GetProperty("hits").EnumerateArray())
        {
            if (!hit.TryGetProperty("_source", out var source))
            {
                continue;
            }

            results.Add(MapSource(source));
        }

        return new TransactionSearchResponseDto(results, total);
    }

    private object BuildSearchBody(string userId, TransactionSearchRequest request)
    {
        var filters = new List<object>
        {
            new { term = new Dictionary<string, object?> { ["userId"] = userId } }
        };

        AddTerm(filters, "dashboardName", request.DashboardName);
        AddTerm(filters, "category", request.Category);
        AddTerm(filters, "transactionType", request.TransactionType);

        if (request.StatementId.HasValue)
        {
            filters.Add(new
            {
                term = new Dictionary<string, object?>
                {
                    ["statementId"] = request.StatementId.Value.ToString()
                }
            });
        }

        var dateRange = new Dictionary<string, object?>();
        if (request.From.HasValue)
        {
            dateRange["gte"] = request.From.Value.ToString("yyyy-MM-dd");
        }

        if (request.To.HasValue)
        {
            dateRange["lte"] = request.To.Value.ToString("yyyy-MM-dd");
        }

        if (dateRange.Count > 0)
        {
            filters.Add(new { range = new Dictionary<string, object?> { ["date"] = dateRange } });
        }

        var amountRange = new Dictionary<string, object?>();
        if (request.MinAmount.HasValue)
        {
            amountRange["gte"] = request.MinAmount.Value;
        }

        if (request.MaxAmount.HasValue)
        {
            amountRange["lte"] = request.MaxAmount.Value;
        }

        if (amountRange.Count > 0)
        {
            filters.Add(new { range = new Dictionary<string, object?> { ["amount"] = amountRange } });
        }

        var must = new List<object>();
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            must.Add(new
            {
                multi_match = new
                {
                    query = request.Query,
                    fields = new[] { "description", "merchant", "category", "transactionType" },
                    fuzziness = "AUTO"
                }
            });
        }

        return new
        {
            size = 100,
            sort = new object[]
            {
                new Dictionary<string, object?> { ["date"] = new { order = "desc" } },
                new Dictionary<string, object?> { ["id"] = new { order = "asc" } }
            },
            query = new
            {
                @bool = new
                {
                    filter = filters,
                    must = must.Count == 0
                        ? new object[] { new { match_all = new { } } }
                        : must.ToArray()
                }
            }
        };
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

    private static void AddTerm(
        ICollection<object> filters,
        string field,
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        filters.Add(new { term = new Dictionary<string, object?> { [field] = value } });
    }

    private static int ReadTotal(JsonElement total)
    {
        if (total.ValueKind == JsonValueKind.Number)
        {
            return total.GetInt32();
        }

        return total.TryGetProperty("value", out var value)
            ? value.GetInt32()
            : 0;
    }

    private static TransactionSearchResultDto MapSource(JsonElement source)
    {
        return new TransactionSearchResultDto(
            ReadGuid(source, "id"),
            ReadGuid(source, "statementId"),
            ReadString(source, "dashboardName") ?? "",
            DateOnly.Parse(ReadString(source, "date") ?? DateOnly.MinValue.ToString("yyyy-MM-dd")),
            ReadString(source, "description") ?? "",
            ReadString(source, "merchant"),
            ReadString(source, "category"),
            ReadDecimal(source, "amount"),
            ReadString(source, "transactionType"));
    }

    private static Guid ReadGuid(JsonElement source, string propertyName)
    {
        var value = ReadString(source, propertyName);
        return Guid.TryParse(value, out var guid) ? guid : Guid.Empty;
    }

    private static string? ReadString(JsonElement source, string propertyName)
    {
        return source.TryGetProperty(propertyName, out var property) &&
               property.ValueKind != JsonValueKind.Null
            ? property.GetString()
            : null;
    }

    private static decimal ReadDecimal(JsonElement source, string propertyName)
    {
        return source.TryGetProperty(propertyName, out var property) &&
               property.TryGetDecimal(out var value)
            ? value
            : 0m;
    }
}
