using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services.Dashboards;
using BudgetlyAI.Services.Persistence;
using MongoDB.Driver;
using BudgetlyAI.Models;
using Clerk.BackendAPI.Models.Components;
using BudgetlyAI.Infrastructure.Auth;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IDashboardQueryService _dashboardQueryService;
    private readonly ILogger<DashboardController> _logger;
    private readonly MongoDbService _mongo;

    public DashboardController(
        MongoDbService mongo,
        IDashboardService dashboardService,
        IDashboardQueryService dashboardQueryService,
        ILogger<DashboardController> logger)
    {
        _mongo = mongo;
        _dashboardService = dashboardService;
        _dashboardQueryService = dashboardQueryService;
        _logger = logger;
    }

    private string UserId => User.GetUserId();


    // ------------------------
    // CREATE
    // POST /api/dashboards
    // ------------------------
    [HttpPost]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> CreateDashboard(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[CreateDashboard] Incoming request");
        _logger.LogInformation("[CreateDashboard] userId={UserId}", UserId);
        _logger.LogInformation("[CreateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[CreateDashboard] pdfCount={Count}", pdfs?.Length ?? 0);

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

        await _dashboardService.CreateDashboardAsync(
            UserId,
            dashboardName,
            pdfs,
            ct);

        _logger.LogInformation("[CreateDashboard] Dashboard successfully created");

        return Ok(new { message = "Dashboard created & ingested" });
    }

    // ------------------------
    // READ  
    // GET /api/dashboards/{name}
    // ------------------------
    [HttpGet("{name}")]
    public async Task<IActionResult> GetDashboardByName(
        [FromRoute] string name,
        CancellationToken ct)
    {
        _logger.LogInformation("[GetDashboardByName] Incoming request");
        _logger.LogInformation("[GetDashboardByName] userId={UserId}", UserId);
        _logger.LogInformation("[GetDashboardByName] dashboardName={Name}", name);

        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("[GetDashboardByName] Missing dashboard name");
            return BadRequest("Dashboard name required");
        }

        var dashboard = await _dashboardQueryService
            .GetByNameAsync(UserId, name, ct);

        if (dashboard is null)
        {
            _logger.LogWarning("[GetDashboardByName] Dashboard not found. name={Name}", name);
            return NotFound("Dashboard not found");
        }

        return Ok(dashboard);
    }

    // ------------------------
    // READ 
    // GET /api/dashboards/income-expense
    // ------------------------
    [Authorize]
    [HttpGet("income-expense")]
    public async Task<IActionResult> GetIncomeExpense(CancellationToken ct)
    {
        _logger.LogInformation("[GetIncomeExpense] Incoming request");

        var userId = User.FindFirst("sub")?.Value;
        _logger.LogInformation("[GetIncomeExpense] userId={UserId}", userId);

        _logger.LogInformation(
            "[GetIncomeExpense] Querying MongoDB for income/expense records");

        var filter = Builders<UserMonthlyIncomeExpense>
            .Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyIncomeExpenses
            .Find(filter)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetIncomeExpense] Retrieved {Count} records",
            docs.Count);

        return Ok(docs);
    }

    // ------------------------
    // READ 
    // GET /api/dashboards/categories
    // ------------------------
    [Authorize]
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategoryExpenditure(CancellationToken ct)
    {
        _logger.LogInformation("[GetCategoryExpenditure] Incoming request");

        var userId = User.FindFirst("sub")?.Value;
        _logger.LogInformation("[GetCategoryExpenditure] userId={UserId}", userId);

        _logger.LogInformation(
            "[GetCategoryExpenditure] Querying MongoDB for category expenditure records");

        var filter = Builders<UserMonthlyCategoryExpenditure>
            .Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyCategoryExpenditures
            .Find(filter)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetCategoryExpenditure] Retrieved {Count} records",
            docs.Count);

        return Ok(docs);
    }


    // ------------------------
    // READ 
    // GET /api/dashboards/names
    // ------------------------
    [HttpGet("names")]
    public async Task<IActionResult> GetDashboardNames(CancellationToken ct)
    {
        _logger.LogInformation("[GetDashboardNames] Incoming request");
        _logger.LogInformation("[GetDashboardNames] userId={UserId}", UserId);

        var names = await _dashboardQueryService
            .GetDashboardNamesAsync(UserId, ct);

        _logger.LogInformation(
            "[GetDashboardNames] Retrieved {Count} dashboard names",
            names.Count);

        return Ok(names);
    }

    // ------------------------
    // UPDATE
    // PUT /api/dashboards/{name}
    // ------------------------
    [HttpPatch("{name}")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> UpdateDashboard(
        [FromRoute] string name,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[UpdateDashboard] Incoming request");
        _logger.LogInformation("[UpdateDashboard] userId={UserId}", UserId);
        _logger.LogInformation("[UpdateDashboard] dashboardName={DashboardName}", name);
        _logger.LogInformation("[UpdateDashboard] pdfCount={Count}", pdfs?.Length ?? 0);

        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("[UpdateDashboard] Missing dashboardName");
            return BadRequest("dashboardName is required");
        }

        if (pdfs is null || pdfs.Length == 0)
        {
            _logger.LogWarning("[UpdateDashboard] No PDFs provided");
            return BadRequest("At least one PDF is required");
        }

        await _dashboardService.UpdateDashboardAsync(
            UserId,
            name,
            pdfs,
            ct);

        _logger.LogInformation("[UpdateDashboard] Dashboard updated successfully");

        return Ok(new { message = "Dashboard updated" });
    }

    // ------------------------
    // DELETE
    // DELETE /api/dashboards/{name}
    // ------------------------
    [HttpDelete("{name}")]
    public async Task<IActionResult> DeleteDashboard(
        [FromRoute] string name,
        CancellationToken ct)
    {
        _logger.LogInformation("[DeleteDashboard] Incoming request");
        _logger.LogInformation("[DeleteDashboard] userId={UserId}", UserId);
        _logger.LogInformation("[DeleteDashboard] dashboardName={DashboardName}", name);

        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("[DeleteDashboard] Missing dashboardName");
            return BadRequest("dashboardName is required");
        }

        await _dashboardService.DeleteDashboardAsync(
            UserId,
            name,
            ct);

        _logger.LogInformation("[DeleteDashboard] Dashboard and all related data deleted");

        return NoContent();
    }


}
