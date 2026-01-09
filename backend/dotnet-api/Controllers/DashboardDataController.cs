
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BudgetlyAI.Services;
using BudgetlyAI.Models;
using Serilog;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardDataController : ControllerBase
{
    private readonly MongoDbService _mongo;
    private readonly ILogger<DashboardDataController> _logger;

    public DashboardDataController(MongoDbService mongo, ILogger<DashboardDataController> logger)
    {
        _mongo = mongo;
        _logger = logger;
    }

    private string? GetUserId() =>
        User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static bool HasValue(string? s) => !string.IsNullOrWhiteSpace(s);

    /// get/fetch
    [HttpGet("{name}")]
    public async Task<IActionResult> GetDashboardByName([FromRoute] string name, CancellationToken ct)
    {
        _logger.LogInformation("[GetDashboardByName] Incoming request. name={Name}", name);

        var userId = GetUserId();
        _logger.LogInformation("[GetDashboardByName] userId={UserId}", userId);

        if (!HasValue(userId))
        {
            _logger.LogWarning("[GetDashboardByName] Unauthorized request: no userId present");
            return Unauthorized("No user.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            _logger.LogWarning("[GetDashboardByName] Missing dashboard name");
            return BadRequest("Dashboard name required.");
        }

        _logger.LogInformation("[GetDashboardByName] Querying MongoDB for dashboard");

        var filter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, name)
        );

        var dash = await _mongo.Dashboards.Find(filter).FirstOrDefaultAsync(ct);

        if (dash is null)
        {
            _logger.LogWarning("[GetDashboardByName] Dashboard not found. name={Name}", name);
            return NotFound("Dashboard not found.");
        }

        _logger.LogInformation("[GetDashboardByName] Dashboard found. dashboardId={Id}", dash.Id);

        return Ok(dash);
    }

    /// get/fetch names
    [HttpGet("names")]
    public async Task<IActionResult> GetDashboardNames(CancellationToken ct)
    {
        _logger.LogInformation("[GetDashboardNames] Incoming request");

        var userId = GetUserId();
        _logger.LogInformation("[GetDashboardNames] userId={UserId}", userId);

        if (!HasValue(userId))
        {
            _logger.LogWarning("[GetDashboardNames] Unauthorized request: no userId");
            return Unauthorized("No user.");
        }

        _logger.LogInformation("[GetDashboardNames] Querying MongoDB for dashboard names");

        var filter = Builders<Dashboard>.Filter.Eq(d => d.UserId, userId);

        var names = await _mongo.Dashboards
            .Find(filter)
            .Project(d => d.Name)
            .ToListAsync(ct);

        _logger.LogInformation("[GetDashboardNames] Retrieved {Count} dashboard names", names.Count);

        return Ok(names);
    }
}
