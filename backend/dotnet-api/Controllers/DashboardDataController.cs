using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BudgetlyAI.Services;
using BudgetlyAI.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardDataController : ControllerBase
{
    private readonly MongoDbService _mongo;

    public DashboardDataController(MongoDbService mongo) => _mongo = mongo;

    private string? GetUserId() =>
        User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static bool HasValue(string? s) => !string.IsNullOrWhiteSpace(s);

    /// GET /api/dashboarddata/{name}

    [HttpGet("{name}")]
    public async Task<IActionResult> GetDashboardByName([FromRoute] string name, CancellationToken ct)
    {
        var userId = GetUserId();
        if (!HasValue(userId)) return Unauthorized("No user.");

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Dashboard name required.");


        var filter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, name)
        );

        var dash = await _mongo.Dashboards.Find(filter).FirstOrDefaultAsync(ct);
        if (dash is null) return NotFound("Dashboard not found.");

        return Ok(dash);
    }


    /// GET /api/dashboarddata/names
    [HttpGet("names")]
    public async Task<IActionResult> GetDashboardNames(CancellationToken ct)
    {
        var userId = GetUserId();
        if (!HasValue(userId)) return Unauthorized("No user.");

        var filter = Builders<Dashboard>.Filter.Eq(d => d.UserId, userId);
        var names = await _mongo.Dashboards
            .Find(filter)
            .Project(d => d.Name)
            .ToListAsync(ct);

        return Ok(names);
    }
}
