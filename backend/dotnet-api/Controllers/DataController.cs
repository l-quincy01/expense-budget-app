using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BudgetlyAI.Services;
using BudgetlyAI.Models;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DataController : ControllerBase
{
    private readonly MongoDbService _mongo;

    public DataController(MongoDbService mongo) => _mongo = mongo;

    private string? GetUserId() =>
        User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static bool HasValue(string? s) => !string.IsNullOrWhiteSpace(s);

    /// GET /api/data/all/transactions

    [HttpGet("all/transactions")]
    public async Task<IActionResult> GetAllTransactions(CancellationToken ct)
    {
        var userId = GetUserId();
        if (!HasValue(userId)) return Unauthorized("No user.");

        var filter = Builders<UserMonthlyTransaction>.Filter.Eq(x => x.UserId, userId);
        var docs = await _mongo.MonthlyTransactions.Find(filter).ToListAsync(ct);
        return Ok(docs);
    }

    /// GET /api/data/all/income-expense

    [HttpGet("all/income-expense")]
    public async Task<IActionResult> GetAllIncomeExpense(CancellationToken ct)
    {
        var userId = GetUserId();
        if (!HasValue(userId)) return Unauthorized("No user.");

        var filter = Builders<UserMonthlyIncomeExpense>.Filter.Eq(x => x.UserId, userId);
        var docs = await _mongo.MonthlyIncomeExpenses.Find(filter).ToListAsync(ct);
        return Ok(docs);
    }

    /// GET /api/data/all/categories

    [HttpGet("all/categories")]
    public async Task<IActionResult> GetAllCategories(CancellationToken ct)
    {
        var userId = GetUserId();
        if (!HasValue(userId)) return Unauthorized("No user.");

        var filter = Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(x => x.UserId, userId);
        var docs = await _mongo.MonthlyCategoryExpenditures.Find(filter).ToListAsync(ct);
        return Ok(docs);
    }
}
