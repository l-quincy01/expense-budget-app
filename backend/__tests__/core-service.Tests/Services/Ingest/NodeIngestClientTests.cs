using System.Net;
using System.Net.Http.Headers;
using BudgetlyAI.Services.Ingest;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Ingest;

public class NodeIngestClientTests
{
    [Fact]
    public async Task CreateDashboardAsync_SendsPostWithFormAndUserHeader()
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

        var client = new NodeIngestClient(
            factory.Object,
            config,
            Mock.Of<ILogger<NodeIngestClient>>());

        var pdf = CreateFormFile("statement.pdf", new byte[] { 1, 2, 3, 4 });

        await client.CreateDashboardAsync("user-1", "main", new IFormFile[] { pdf }, CancellationToken.None);

        captured.Should().NotBeNull();
        captured!.Method.Should().Be(HttpMethod.Post);
        captured.RequestUri!.ToString().Should().Be("http://localhost:4010/api/dashboards");
        captured.Headers.GetValues("x-user-id").Should().Contain("user-1");

        var multipart = captured.Content.Should().BeOfType<MultipartFormDataContent>().Subject.ToList();
        multipart.Should().HaveCount(2);

        var dashboardNamePart = multipart.Single(p =>
            p.Headers.ContentDisposition?.Name?.Trim('\"') == "dashboardName");
        var dashboardName = await dashboardNamePart.ReadAsStringAsync();
        dashboardName.Should().Be("main");

        var pdfPart = multipart.Single(p =>
            p.Headers.ContentDisposition?.Name?.Trim('\"') == "pdfs");
        pdfPart.Headers.ContentType.Should().Be(MediaTypeHeaderValue.Parse("application/pdf"));
        pdfPart.Headers.ContentDisposition!.FileName!.Trim('\"').Should().Be("statement.pdf");
        var bytes = await pdfPart.ReadAsByteArrayAsync();
        bytes.Should().Equal(new byte[] { 1, 2, 3, 4 });
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

        var client = new NodeIngestClient(
            factory.Object,
            config,
            Mock.Of<ILogger<NodeIngestClient>>());

        var pdf = CreateFormFile("file.pdf", new byte[] { 9, 9 });

        await client.UpdateDashboardAsync("user-2", "dash with space", new IFormFile[] { pdf }, CancellationToken.None);

        captured.Should().NotBeNull();
        captured!.Method.Should().Be(HttpMethod.Patch);
        captured.RequestUri!.ToString().Should().Be("http://localhost:4010/api/dashboards/dash%20with%20space");
        captured.Headers.GetValues("x-user-id").Should().Contain("user-2");
    }

    [Fact]
    public async Task CreateDashboardAsync_ThrowsWhenResponseNotSuccessful()
    {
        var handler = new TestHandler(_ =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("bad")
            }));

        var httpClient = new HttpClient(handler);
        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(f => f.CreateClient("AiIngest")).Returns(httpClient);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["NodeIngest:BaseUrl"] = "http://localhost:4010/api/dashboards"
            })
            .Build();

        var client = new NodeIngestClient(
            factory.Object,
            config,
            Mock.Of<ILogger<NodeIngestClient>>());

        var pdf = CreateFormFile("file.pdf", Array.Empty<byte>());

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            client.CreateDashboardAsync("user-1", "dash", new IFormFile[] { pdf }, CancellationToken.None));
    }

    private static FormFile CreateFormFile(string fileName, byte[] bytes)
    {
        var stream = new MemoryStream(bytes);
        var file = new FormFile(stream, 0, bytes.Length, "pdfs", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };
        return file;
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
