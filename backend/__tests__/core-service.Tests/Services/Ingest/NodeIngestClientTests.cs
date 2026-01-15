using System.Net;
using System.Net.Http.Headers;
using System.Text;
using BudgetlyAI.Services.Ingest;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CoreService.Tests.Services.Ingest;

public class NodeIngestClientTests
{
    [Fact]
    public async Task CreateDashboardAsync_SendsPostWithFormAndUserHeader()
    {
        HttpRequestMessage? captured = null;

        //  Capture the multipart parts while request is still alive
        var capturedParts = new List<(string Name, string? FileName, string? ContentType, byte[] Bytes)>();

        var handler = new TestHandler(async req =>
        {
            captured = req;

            if (req.Content is MultipartFormDataContent mp)
            {
                foreach (var part in mp)
                {
                    var name = part.Headers.ContentDisposition?.Name?.Trim('\"') ?? "";
                    var fileName = part.Headers.ContentDisposition?.FileName?.Trim('\"');
                    var contentType = part.Headers.ContentType?.ToString();
                    var bytes = await part.ReadAsByteArrayAsync();
                    capturedParts.Add((name, fileName, contentType, bytes));
                }
            }

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("ok")
            };
        });

        var httpClient = new HttpClient(handler);
        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(f => f.CreateClient("AiIngest")).Returns(httpClient);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["NodeIngest:BaseUrl"] = "http://localhost:4010/api/dashboards"
            })
            .Build();

        var client = new NodeIngestClient(factory.Object, config, Mock.Of<ILogger<NodeIngestClient>>());

        var pdf = CreateFormFile("statement.pdf", new byte[] { 1, 2, 3, 4 });

        // Act
        await client.CreateDashboardAsync("user-1", "main", new IFormFile[] { pdf }, CancellationToken.None);

        // Assert
        captured.Should().NotBeNull();
        captured!.Method.Should().Be(HttpMethod.Post);
        captured.RequestUri!.AbsoluteUri.Should().Be("http://localhost:4010/api/dashboards");
        captured.Headers.GetValues("x-user-id").Should().Contain("user-1");

        capturedParts.Should().HaveCount(2);

        var dashboardNamePart = capturedParts.Single(p => p.Name == "dashboardName");
        Encoding.UTF8.GetString(dashboardNamePart.Bytes).Should().Be("main");

        var pdfPart = capturedParts.Single(p => p.Name == "pdfs");
        pdfPart.FileName.Should().Be("statement.pdf");
        pdfPart.ContentType.Should().Be("application/pdf");
        pdfPart.Bytes.Should().Equal(new byte[] { 1, 2, 3, 4 });
    }

    [Fact]
    public async Task UpdateDashboardAsync_SendsPatchToEncodedUrl()
    {
        HttpRequestMessage? captured = null;

        var handler = new TestHandler(req =>
        {
            captured = req;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("ok")
            });
        });

        var httpClient = new HttpClient(handler);
        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(f => f.CreateClient("AiIngest")).Returns(httpClient);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["NodeIngest:BaseUrl"] = "http://localhost:4010/api/dashboards"
            })
            .Build();

        var client = new NodeIngestClient(factory.Object, config, Mock.Of<ILogger<NodeIngestClient>>());

        var pdf = CreateFormFile("file.pdf", new byte[] { 9, 9 });

        await client.UpdateDashboardAsync("user-2", "dash with space", new IFormFile[] { pdf }, CancellationToken.None);

        captured.Should().NotBeNull();
        captured!.Method.Should().Be(HttpMethod.Patch);


        captured.RequestUri!.AbsoluteUri
            .Should().Be("http://localhost:4010/api/dashboards/dash%20with%20space");

        captured.Headers.GetValues("x-user-id").Should().Contain("user-2");
    }

    private static FormFile CreateFormFile(string fileName, byte[] bytes)
    {
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "pdfs", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };
    }

    private sealed class TestHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _handler;

        public TestHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> handler)
        {
            _handler = handler;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            return _handler(request);
        }
    }
}
