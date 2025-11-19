using BudgetlyAI.Data;
using BudgetlyAI.Models;
using BudgetlyAI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly BudgetsDbContext _context;
    private readonly ClerkAuthService _clerkAuth;

    public TransactionsController(BudgetsDbContext context, ClerkAuthService clerkAuth)
    {
        _context = context;
        _clerkAuth = clerkAuth;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] string? dashboardName)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var query = _context.UserAddedTransactions.Where(t => t.UserId == userId);
        if (!string.IsNullOrWhiteSpace(dashboardName))
        {
            query = query.Where(t => t.DashboardName == dashboardName);
        }

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] UserAddedTransaction transaction)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        transaction.UserId = userId;
        transaction.Id = Guid.NewGuid();
        transaction.Date = transaction.Date.Date;

        _context.UserAddedTransactions.Add(transaction);
        await _context.SaveChangesAsync();
        return Ok(transaction);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UserAddedTransaction updatedTransaction)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var existing = await _context.UserAddedTransactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (existing is null) return NotFound();

        existing.DashboardName = updatedTransaction.DashboardName;
        existing.Date = updatedTransaction.Date.Date;
        existing.Description = updatedTransaction.Description;
        existing.Amount = updatedTransaction.Amount;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var entity = await _context.UserAddedTransactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (entity is null) return NotFound();

        _context.UserAddedTransactions.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
