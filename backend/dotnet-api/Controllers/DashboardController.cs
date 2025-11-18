using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Clerk.BackendAPI;
using System.IdentityModel.Tokens.Jwt;
using BudgetlyAI.Services;
using MongoDB.Driver;
using BudgetlyAI.Models;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ClerkBackendApi _clerk;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly MongoDbService _mongo;

    public DashboardController(
        ClerkBackendApi clerk,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        MongoDbService mongo)
    {
        _clerk = clerk;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _mongo = mongo;
    }

    [HttpPost("create")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> CreateDashboard(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {

        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid Clerk token");


        if (string.IsNullOrWhiteSpace(dashboardName))
            return BadRequest("dashboardName is required");

        if (pdfs is null || pdfs.Length == 0)
            return BadRequest("At least one PDF is required");



        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeApiUrl = _config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/ingest";

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(fileContent, "pdfs", pdf.FileName);
        }


        var req = new HttpRequestMessage(HttpMethod.Post, nodeApiUrl);
        req.Content = form;
        req.Headers.Add("x-user-id", userId);


        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, new { error = body });

        return Ok(new { message = "Dashboard created & ingested", nodeResponse = body });
    }


    [HttpPost("update")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> UpdateDashboard(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {

        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid Clerk token");


        if (string.IsNullOrWhiteSpace(dashboardName))
            return BadRequest("dashboardName is required");

        if (pdfs is null || pdfs.Length == 0)
            return BadRequest("At least one PDF is required");


        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeUpdateUrl = _config["NodeIngest:UpdateUrl"] ?? "http://localhost:4010/api/update-dashboard";

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(fileContent, "pdfs", pdf.FileName);
        }


        var req = new HttpRequestMessage(HttpMethod.Post, nodeUpdateUrl);
        req.Content = form;
        req.Headers.Add("x-user-id", userId);


        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, new { error = body });

        return Ok(new { message = "Dashboard updated", nodeResponse = body });
    }

    [HttpDelete("{dashboardName}")]
    public async Task<IActionResult> DeleteDashboardByName([FromRoute] string dashboardName, CancellationToken ct)
    {
        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid Clerk token");

        if (string.IsNullOrWhiteSpace(dashboardName))
            return BadRequest("dashboardName is required");

        var decodedName = Uri.UnescapeDataString(dashboardName);

        var dashboardFilter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, decodedName)
        );

        var deleteResult = await _mongo.Dashboards.DeleteOneAsync(dashboardFilter, cancellationToken: ct);
        if (deleteResult.DeletedCount == 0)
            return NotFound("Dashboard not found.");

        var transactionsFilter = Builders<UserMonthlyTransaction>.Filter.And(
            Builders<UserMonthlyTransaction>.Filter.Eq(t => t.UserId, userId),
            Builders<UserMonthlyTransaction>.Filter.Eq(t => t.DashboardName, decodedName)
        );
        await _mongo.MonthlyTransactions.DeleteManyAsync(transactionsFilter, cancellationToken: ct);

        var incomeExpenseFilter = Builders<UserMonthlyIncomeExpense>.Filter.And(
            Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.UserId, userId),
            Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.DashboardName, decodedName)
        );
        await _mongo.MonthlyIncomeExpenses.DeleteManyAsync(incomeExpenseFilter, cancellationToken: ct);

        var categoryFilter = Builders<UserMonthlyCategoryExpenditure>.Filter.And(
            Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.UserId, userId),
            Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.DashboardName, decodedName)
        );
        await _mongo.MonthlyCategoryExpenditures.DeleteManyAsync(categoryFilter, cancellationToken: ct);

        return NoContent();
    }
}
