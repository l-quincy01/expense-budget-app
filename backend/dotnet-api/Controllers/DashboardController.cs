
using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Clerk.BackendAPI;
using System.IdentityModel.Tokens.Jwt;
using BudgetlyAI.Services;
using MongoDB.Driver;
using BudgetlyAI.Models;
using Serilog;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ClerkBackendApi _clerk;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly MongoDbService _mongo;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        ClerkBackendApi clerk,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        MongoDbService mongo,
        ILogger<DashboardController> logger)
    {
        _clerk = clerk;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _mongo = mongo;
        _logger = logger;
    }


    // Create

    [HttpPost]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> CreateDashboard(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[CreateDashboard] Incoming request");

        // auth
        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

        _logger.LogInformation("[CreateDashboard] userId={UserId}", userId);
        _logger.LogInformation("[CreateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[CreateDashboard] pdfCount={Count}", pdfs?.Length ?? 0);

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("[CreateDashboard] Unauthorized: missing or invalid token");
            return Unauthorized("Invalid Clerk token");
        }

        if (string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogWarning("[CreateDashboard] Missing dashboardName");
            return BadRequest("dashboardName is required");
        }

        if (pdfs is null || pdfs.Length == 0)
        {
            _logger.LogWarning("[CreateDashboard] No PDF files provided");
            return BadRequest("At least one PDF is required");
        }

        // Node call
        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeApiUrl = _config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/dashboards";

        _logger.LogInformation("[CreateDashboard] Node ingest URL: {Url}", nodeApiUrl);

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            _logger.LogInformation("[CreateDashboard] Attaching file: {FileName}", pdf.FileName);

            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(fileContent, "pdfs", pdf.FileName);
        }

        var req = new HttpRequestMessage(HttpMethod.Post, nodeApiUrl);
        req.Content = form;
        req.Headers.Add("x-user-id", userId);

        _logger.LogInformation("[CreateDashboard] Sending request to Node ingest service");

        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        _logger.LogInformation("[CreateDashboard] Node response code: {StatusCode}", resp.StatusCode);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("[CreateDashboard] Node API error: {Error}", body);
            return StatusCode((int)resp.StatusCode, new { error = body });
        }

        _logger.LogInformation("[CreateDashboard] Dashboard successfully created");

        return Ok(new { message = "Dashboard created & ingested", nodeResponse = body });
    }


    // update 

    [HttpPut("{dashboardName}")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> UpdateDashboard(
        [FromRoute] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[UpdateDashboard] Incoming request");
        _logger.LogInformation("[UpdateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[UpdateDashboard] pdfCount={Count}", pdfs?.Length ?? 0);

        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

        _logger.LogInformation("[UpdateDashboard] userId={UserId}", userId);

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("[UpdateDashboard] Unauthorized");
            return Unauthorized("Invalid Clerk token");
        }

        if (string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogWarning("[UpdateDashboard] Missing dashboardName");
            return BadRequest("dashboardName is required");
        }
        if (pdfs is null || pdfs.Length == 0)
        {
            _logger.LogWarning("[UpdateDashboard] No PDFs provided");
            return BadRequest("At least one PDF is required");
        }

        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeUpdateUrl =
            $"{(_config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/dashboards")}/{Uri.EscapeDataString(dashboardName)}";

        _logger.LogInformation("[UpdateDashboard] Node update URL: {Url}", nodeUpdateUrl);

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            _logger.LogInformation("[UpdateDashboard] Attaching file: {FileName}", pdf.FileName);

            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(fileContent, "pdfs", pdf.FileName);
        }

        var req = new HttpRequestMessage(HttpMethod.Put, nodeUpdateUrl);
        req.Content = form;
        req.Headers.Add("x-user-id", userId);

        _logger.LogInformation("[UpdateDashboard] Sending update request to Node");

        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        _logger.LogInformation("[UpdateDashboard] Node response code: {StatusCode}", resp.StatusCode);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("[UpdateDashboard] Node API error: {Error}", body);
            return StatusCode((int)resp.StatusCode, new { error = body });
        }

        _logger.LogInformation("[UpdateDashboard] Dashboard updated successfully");

        return Ok(new { message = "Dashboard updated", nodeResponse = body });
    }


    // delete

    [HttpDelete("{dashboardName}")]
    public async Task<IActionResult> DeleteDashboardByName([FromRoute] string dashboardName, CancellationToken ct)
    {
        _logger.LogInformation("[DeleteDashboard] Incoming request");
        _logger.LogInformation("[DeleteDashboard] dashboardName={DashboardName}", dashboardName);

        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

        _logger.LogInformation("[DeleteDashboard] userId={UserId}", userId);

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("[DeleteDashboard] Unauthorized");
            return Unauthorized("Invalid Clerk token");
        }

        if (string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogWarning("[DeleteDashboard] Missing dashboardName");
            return BadRequest("dashboardName is required");
        }

        var decodedName = Uri.UnescapeDataString(dashboardName);
        _logger.LogInformation("[DeleteDashboard] decodedDashboardName={Decoded}", decodedName);

        var dashboardFilter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, decodedName)
        );

        _logger.LogInformation("[DeleteDashboard] Deleting dashboard record");

        var deleteResult = await _mongo.Dashboards.DeleteOneAsync(dashboardFilter, cancellationToken: ct);

        if (deleteResult.DeletedCount == 0)
        {
            _logger.LogWarning("[DeleteDashboard] Dashboard not found");
            return NotFound("Dashboard not found.");
        }

        _logger.LogInformation("[DeleteDashboard] Deleted 1 dashboard record");
        _logger.LogInformation("[DeleteDashboard] Cleaning related collections");

        await _mongo.MonthlyTransactions.DeleteManyAsync(
            Builders<UserMonthlyTransaction>.Filter.And(
                Builders<UserMonthlyTransaction>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyTransaction>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        await _mongo.MonthlyIncomeExpenses.DeleteManyAsync(
            Builders<UserMonthlyIncomeExpense>.Filter.And(
                Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        await _mongo.MonthlyCategoryExpenditures.DeleteManyAsync(
            Builders<UserMonthlyCategoryExpenditure>.Filter.And(
                Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        _logger.LogInformation("[DeleteDashboard] Dashboard and all related data deleted");

        return NoContent();
    }
}
