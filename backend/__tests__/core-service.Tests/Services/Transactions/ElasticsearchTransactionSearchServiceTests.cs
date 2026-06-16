using System.Net;
using System.Text;
using BudgetlyAI.Services.Transactions;
using Microsoft.Extensions.Configuration;

namespace CoreService.Tests.Services.Transactions;

public class ElasticsearchTransactionSearchServiceTests
{
    [Fact]
    public async Task SearchAsync_AlwaysScopesByUserAndMapsFilters()
    {
        var handler = new CapturingHandler(
            """
            {
              "hits": {
                "total": { "value": 0 },
                "hits": []
              }
            }
            """);
        var httpClient = new HttpClient(handler);
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Elasticsearch:Uri"] = "http://localhost:9200",
                ["Elasticsearch:TransactionIndexName"] = "transactions-test"
            })
            .Build();
        var service = new ElasticsearchTransactionSearchService(httpClient, configuration);

        await service.SearchAsync(
            "user-123",
            new TransactionSearchRequest(
                "checkers",
                "groceries",
                new DateOnly(2026, 1, 1),
                new DateOnly(2026, 1, 31),
                10m,
                250m,
                "expense",
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                "Main"));

        handler.Body.Should().Contain("\"userId\":\"user-123\"");
        handler.Body.Should().Contain("\"dashboardName\":\"Main\"");
        handler.Body.Should().Contain("\"category\":\"groceries\"");
        handler.Body.Should().Contain("\"transactionType\":\"expense\"");
        handler.Body.Should().Contain("\"statementId\":\"11111111-1111-1111-1111-111111111111\"");
        handler.Body.Should().Contain("\"gte\":\"2026-01-01\"");
        handler.Body.Should().Contain("\"lte\":\"2026-01-31\"");
        handler.Body.Should().Contain("\"gte\":10");
        handler.Body.Should().Contain("\"lte\":250");
        handler.Body.Should().Contain("\"query\":\"checkers\"");
        handler.RequestUri!.AbsolutePath.Should().Be("/transactions-test/_search");
    }

    private sealed class CapturingHandler : HttpMessageHandler
    {
        private readonly string _response;

        public CapturingHandler(string response)
        {
            _response = response;
        }

        public string Body { get; private set; } = "";
        public Uri? RequestUri { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri;
            Body = request.Content is null
                ? ""
                : await request.Content.ReadAsStringAsync(cancellationToken);

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(_response, Encoding.UTF8, "application/json")
            };
        }
    }
}
