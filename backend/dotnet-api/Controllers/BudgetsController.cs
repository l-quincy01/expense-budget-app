
using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services;
using BudgetlyAI.Models;
using BudgetlyAI.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly BudgetsDbContext _context;
    private readonly ClerkAuthService _clerkAuth;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(
        BudgetsDbContext context,
        ClerkAuthService clerkAuth,
        ILogger<BudgetsController> logger)
    {
        _context = context;
        _clerkAuth = clerkAuth;
        _logger = logger;
    }


    // fetch/get

    [HttpGet]
    public async Task<IActionResult> GetBudgets([FromQuery] string? dashboardName)
    {
        _logger.LogInformation("[GetBudgets] Incoming request. dashboardName={DashboardName}", dashboardName);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[GetBudgets] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation("[GetBudgets] Authenticated userId={UserId}", userId);

        var query = _context.UserAddedBudgets.Where(b => b.UserId == userId);

        if (!string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogInformation("[GetBudgets] Filtering by dashboardName={DashboardName}", dashboardName);
            query = query.Where(b => b.DashboardName == dashboardName);
        }

        var budgets = await query.OrderBy(b => b.Category).ToListAsync();

        _logger.LogInformation("[GetBudgets] Returning {Count} budget records", budgets.Count);

        return Ok(budgets);
    }


    // create

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

        _logger.LogInformation("[CreateBudget] Authenticated userId={UserId}", userId);

        budget.UserId = userId;
        budget.Id = Guid.NewGuid();

        _logger.LogInformation("[CreateBudget] Creating budget. budgetId={BudgetId}, category={Category}, dashboard={DashboardName}",
            budget.Id, budget.Category, budget.DashboardName);

        _context.UserAddedBudgets.Add(budget);
        await _context.SaveChangesAsync();

        _logger.LogInformation("[CreateBudget] Budget created successfully");

        return Ok(budget);
    }

    // update

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBudget(Guid id, [FromBody] UserAddedBudget updatedBudget)
    {
        _logger.LogInformation("[UpdateBudget] Incoming request. budgetId={BudgetId}", id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[UpdateBudget] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation("[UpdateBudget] Authenticated userId={UserId}", userId);

        var existing = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (existing is null)
        {
            _logger.LogWarning("[UpdateBudget] Budget not found. budgetId={BudgetId}", id);
            return NotFound();
        }

        _logger.LogInformation("[UpdateBudget] Updating budget. category={Category}, dashboard={DashboardName}",
            updatedBudget.Category, updatedBudget.DashboardName);

        existing.DashboardName = updatedBudget.DashboardName;
        existing.Category = updatedBudget.Category;
        existing.BudgetAmount = updatedBudget.BudgetAmount;
        existing.SpentAmount = updatedBudget.SpentAmount;

        await _context.SaveChangesAsync();
        _logger.LogInformation("[UpdateBudget] Budget updated successfully");

        return Ok(existing);
    }


    // delete

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        _logger.LogInformation("[DeleteBudget] Incoming request. budgetId={BudgetId}", id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[DeleteBudget] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation("[DeleteBudget] Authenticated userId={UserId}", userId);

        var entity = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (entity is null)
        {
            _logger.LogWarning("[DeleteBudget] Budget not found. budgetId={BudgetId}", id);
            return NotFound();
        }

        _logger.LogInformation("[DeleteBudget] Deleting budget. category={Category}, dashboard={Dashboard}",
            entity.Category, entity.DashboardName);

        _context.UserAddedBudgets.Remove(entity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("[DeleteBudget] Budget deleted successfully");

        return NoContent();
    }
}
