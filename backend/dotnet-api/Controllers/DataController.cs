
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
public class DataController : ControllerBase
{
    private readonly MongoDbService _mongo;
    private readonly ILogger<DataController> _logger;

    public DataController(MongoDbService mongo, ILogger<DataController> logger)
    {
        _mongo = mongo;
        _logger = logger;
    }

    private string? GetUserId() =>
        User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static bool HasValue(string? s) => !string.IsNullOrWhiteSpace(s);


    [HttpGet("all/transactions")]
    public async Task<IActionResult> GetAllTransactions(CancellationToken ct)
    {
        _logger.LogInformation("[GetAllTransactions] Incoming request");

        var userId = GetUserId();
        _logger.LogInformation("[GetAllTransactions] userId={UserId}", userId);

        if (!HasValue(userId))
        {
            _logger.LogWarning("[GetAllTransactions] Unauthorized request: no userId");
            return Unauthorized("No user.");
        }

        _logger.LogInformation("[GetAllTransactions] Querying MongoDB for monthly transactions");

        var filter = Builders<UserMonthlyTransaction>.Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyTransactions.Find(filter).ToListAsync(ct);

        _logger.LogInformation("[GetAllTransactions] Retrieved {Count} records", docs.Count);

        return Ok(docs);
    }


    [HttpGet("all/income-expense")]
    public async Task<IActionResult> GetAllIncomeExpense(CancellationToken ct)
    {
        _logger.LogInformation("[GetAllIncomeExpense] Incoming request");

        var userId = GetUserId();
        _logger.LogInformation("[GetAllIncomeExpense] userId={UserId}", userId);

        if (!HasValue(userId))
        {
            _logger.LogWarning("[GetAllIncomeExpense] Unauthorized request: no userId");
            return Unauthorized("No user.");
        }

        _logger.LogInformation("[GetAllIncomeExpense] Querying MongoDB for income/expense records");

        var filter = Builders<UserMonthlyIncomeExpense>.Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyIncomeExpenses.Find(filter).ToListAsync(ct);

        _logger.LogInformation("[GetAllIncomeExpense] Retrieved {Count} records", docs.Count);

        return Ok(docs);
    }


    [HttpGet("all/categories")]
    public async Task<IActionResult> GetAllCategories(CancellationToken ct)
    {
        _logger.LogInformation("[GetAllCategories] Incoming request");

        var userId = GetUserId();
        _logger.LogInformation("[GetAllCategories] userId={UserId}", userId);

        if (!HasValue(userId))
        {
            _logger.LogWarning("[GetAllCategories] Unauthorized request: no userId");
            return Unauthorized("No user.");
        }

        _logger.LogInformation("[GetAllCategories] Querying MongoDB for category expenditure records");

        var filter = Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyCategoryExpenditures.Find(filter).ToListAsync(ct);

        _logger.LogInformation("[GetAllCategories] Retrieved {Count} records", docs.Count);

        return Ok(docs);
    }
}
