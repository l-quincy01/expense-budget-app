using BudgetlyAI.Data;
using BudgetlyAI.Models;
using BudgetlyAI.Services;
using BudgetlyAI.Services.Auth;
using BudgetlyAI.Services.Persistence;
using BudgetlyAI.Services.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using MongoDB.Driver;


[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ClerkAuthService _clerkAuth;
    private readonly ILogger<TransactionsController> _logger;
    private readonly MongoDbService _mongo;

    public TransactionsController(
        MongoDbService mongo,
        ITransactionService transactionService,
        ClerkAuthService clerkAuth,
        ILogger<TransactionsController> logger)
    {
        _mongo = mongo;
        _transactionService = transactionService;
        _clerkAuth = clerkAuth;
        _logger = logger;
    }


    // ------------------------
    // CREATE
    // POST /api/transactions/
    // ------------------------
    [HttpPost]
    public async Task<IActionResult> CreateTransaction(
        [FromBody] UserAddedTransaction transaction)
    {
        _logger.LogInformation("[CreateTransaction] Incoming request");

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[CreateTransaction] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[CreateTransaction] Authenticated userId={UserId}",
            userId);

        var created = await _transactionService
            .CreateTransactionAsync(userId, transaction);

        return Ok(created);
    }

    // ------------------------
    // READ
    // GET /api/transactions/{name}
    // ------------------------
    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] string? dashboardName)
    {
        _logger.LogInformation(
            "[GetTransactions] Incoming request. dashboardName={DashboardName}",
            dashboardName);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[GetTransactions] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[GetTransactions] Authenticated userId={UserId}",
            userId);

        var transactions = await _transactionService
            .GetTransactionsAsync(userId, dashboardName);

        return Ok(transactions);
    }
    // ------------------------
    // READ
    // GET /api/transactions/monthly
    // ------------------------

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyTransactions(CancellationToken ct)
    {
        _logger.LogInformation("[GetMonthlyTransactions] Incoming request");

        var userId = User.FindFirst("sub")?.Value;
        _logger.LogInformation("[GetMonthlyTransactions] userId={UserId}", userId);

        _logger.LogInformation("[GetMonthlyTransactions] Querying MongoDB for monthly transactions");

        var filter = Builders<UserMonthlyTransaction>
            .Filter.Eq(x => x.UserId, userId);

        var docs = await _mongo.MonthlyTransactions
            .Find(filter)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetMonthlyTransactions] Retrieved {Count} records",
            docs.Count);

        return Ok(docs);
    }




    // ------------------------
    // UPDATE
    // UPDATE /api/transactions/{id}
    // ------------------------  

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTransaction(
        Guid id,
        [FromBody] UserAddedTransaction updatedTransaction)
    {
        _logger.LogInformation(
            "[UpdateTransaction] Incoming request. transactionId={TransactionId}",
            id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[UpdateTransaction] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[UpdateTransaction] Authenticated userId={UserId}",
            userId);

        var updated = await _transactionService
            .UpdateTransactionAsync(userId, id, updatedTransaction);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    // ------------------------
    // DELETE
    // DELETE /api/transactions/{id}
    // ------------------------  
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        _logger.LogInformation(
            "[DeleteTransaction] Incoming request. transactionId={TransactionId}",
            id);

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[DeleteTransaction] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation(
            "[DeleteTransaction] Authenticated userId={UserId}",
            userId);

        var deleted = await _transactionService
            .DeleteTransactionAsync(userId, id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
