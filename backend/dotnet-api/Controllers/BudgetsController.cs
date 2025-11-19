using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services;
using BudgetlyAI.Models;
using BudgetlyAI.Data;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly BudgetsDbContext _context;
    private readonly ClerkAuthService _clerkAuth;

    public BudgetsController(BudgetsDbContext context, ClerkAuthService clerkAuth)
    {
        _context = context;
        _clerkAuth = clerkAuth;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets([FromQuery] string? dashboardName)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var query = _context.UserAddedBudgets.Where(b => b.UserId == userId);
        if (!string.IsNullOrWhiteSpace(dashboardName))
        {
            query = query.Where(b => b.DashboardName == dashboardName);
        }

        var budgets = await query
            .OrderBy(b => b.Category)
            .ToListAsync();

        return Ok(budgets);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] UserAddedBudget budget)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        budget.UserId = userId;
        budget.Id = Guid.NewGuid();

        _context.UserAddedBudgets.Add(budget);
        await _context.SaveChangesAsync();
        return Ok(budget);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBudget(Guid id, [FromBody] UserAddedBudget updatedBudget)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var existing = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (existing is null) return NotFound();

        existing.DashboardName = updatedBudget.DashboardName;
        existing.Category = updatedBudget.Category;
        existing.BudgetAmount = updatedBudget.BudgetAmount;
        existing.SpentAmount = updatedBudget.SpentAmount;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var entity = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (entity is null) return NotFound();

        _context.UserAddedBudgets.Remove(entity);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
