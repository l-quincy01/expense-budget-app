using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace BudgetlyAI.Services.Ingest;

public class NodeIngestClient : INodeIngestClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<NodeIngestClient> _logger;

    public NodeIngestClient(
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<NodeIngestClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task CreateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[CreateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[CreateDashboard] pdfCount={Count}", pdfs.Length);

        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeApiUrl =
            _config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/dashboards";

        _logger.LogInformation("[CreateDashboard] Node ingest URL: {Url}", nodeApiUrl);

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            _logger.LogInformation(
                "[CreateDashboard] Attaching file: {FileName}",
                pdf.FileName);

            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType =
                new MediaTypeHeaderValue("application/pdf");

            form.Add(fileContent, "pdfs", pdf.FileName);
        }

        var req = new HttpRequestMessage(HttpMethod.Post, nodeApiUrl)
        {
            Content = form
        };
        req.Headers.Add("x-user-id", userId);

        _logger.LogInformation("[CreateDashboard] Sending request to Node ingest service");

        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        _logger.LogInformation(
            "[CreateDashboard] Node response code: {StatusCode}",
            resp.StatusCode);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "[CreateDashboard] Node API error: {Error}",
                body);

            throw new InvalidOperationException(body);
        }

        _logger.LogInformation("[CreateDashboard] Dashboard successfully created");
    }

    public async Task UpdateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[UpdateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[UpdateDashboard] pdfCount={Count}", pdfs.Length);

        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeUpdateUrl =
            $"{(_config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/dashboards")}/{Uri.EscapeDataString(dashboardName)}";

        _logger.LogInformation("[UpdateDashboard] Node update URL: {Url}", nodeUpdateUrl);

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            _logger.LogInformation(
                "[UpdateDashboard] Attaching file: {FileName}",
                pdf.FileName);

            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType =
                new MediaTypeHeaderValue("application/pdf");

            form.Add(fileContent, "pdfs", pdf.FileName);
        }

        var req = new HttpRequestMessage(HttpMethod.Patch, nodeUpdateUrl)
        {
            Content = form
        };
        req.Headers.Add("x-user-id", userId);

        _logger.LogInformation("[UpdateDashboard] Sending update request to Node");

        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        _logger.LogInformation(
            "[UpdateDashboard] Node response code: {StatusCode}",
            resp.StatusCode);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "[UpdateDashboard] Node API error: {Error}",
                body);

            throw new InvalidOperationException(body);
        }

        _logger.LogInformation("[UpdateDashboard] Dashboard updated successfully");
    }
}
