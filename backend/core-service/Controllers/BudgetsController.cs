
using Microsoft.AspNetCore.Mvc;

using BudgetlyAI.Services.Budgets;
using BudgetlyAI.Services.Auth;
using BudgetlyAI.Models;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;
    private readonly ClerkAuthService _clerkAuth;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(
        IBudgetService budgetService,
        ClerkAuthService clerkAuth,
        ILogger<BudgetsController> logger)
    {
        _budgetService = budgetService;
        _clerkAuth = clerkAuth;
        _logger = logger;
    }

    // ------------------------
    // CREATE
    // POST /api/budgets
    // ------------------------
    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] UserAddedBudget budget)
    {
        _logger.LogInformation("[CreateBudget] Incoming request");

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[CreateBudget] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[CreateBudget] Authenticated userId={UserId}",
            userId);

        var created = await _budgetService
            .CreateBudgetAsync(userId, budget);

        return Ok(created);
    }

    // ------------------------
    // READ
    // GET /api/budgets
    // ------------------------
    [HttpGet]
    public async Task<IActionResult> GetBudgets([FromQuery] string? dashboardName)
    {
        _logger.LogInformation(
            "[GetBudgets] Incoming request. dashboardName={DashboardName}",
            dashboardName);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[GetBudgets] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[GetBudgets] Authenticated userId={UserId}",
            userId);

        var budgets = await _budgetService
            .GetBudgetsAsync(userId, dashboardName);

        return Ok(budgets);
    }

    // ------------------------
    // UPDATE
    // PATCH /api/budgets/{id}
    // ------------------------

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBudget(
        Guid id,
        [FromBody] UserAddedBudget updatedBudget)
    {
        _logger.LogInformation(
            "[UpdateBudget] Incoming request. budgetId={BudgetId}",
            id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[UpdateBudget] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[UpdateBudget] Authenticated userId={UserId}",
            userId);

        var updated = await _budgetService
            .UpdateBudgetAsync(userId, id, updatedBudget);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    // ------------------------
    // DELETE
    // DELETE /api/budgets/{id}
    // ------------------------
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        _logger.LogInformation(
            "[DeleteBudget] Incoming request. budgetId={BudgetId}",
            id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[DeleteBudget] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[DeleteBudget] Authenticated userId={UserId}",
            userId);

        var deleted = await _budgetService
            .DeleteBudgetAsync(userId, id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
