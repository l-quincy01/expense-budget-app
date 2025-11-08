using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services;
using BudgetlyAI.Models;
using MongoDB.Driver;
namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly MongoDbService _db;
    private readonly ClerkAuthService _clerkAuth;

    public BudgetsController(MongoDbService db, ClerkAuthService clerkAuth)
    {
        _db = db;
        _clerkAuth = clerkAuth;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets()
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        var results = await _db.Budgets.Find(b => b.UserId == userId).ToListAsync();
        return Ok(results);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] Budget budget)
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null) return Unauthorized();

        budget.UserId = userId;
        await _db.Budgets.InsertOneAsync(budget);
        return Ok(budget);
    }
}
