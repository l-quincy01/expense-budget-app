using BudgetlyAI.Data;
using BudgetlyAI.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Services.Transactions;

public class TransactionService : ITransactionService
{
    private readonly BudgetsDbContext _context;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(
        BudgetsDbContext context,
        ILogger<TransactionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<UserAddedTransaction>> GetTransactionsAsync(
        string userId,
        string? dashboardName,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[GetTransactions] Fetching transactions for userId={UserId}",
            userId);

        var query = _context.UserAddedTransactions
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogInformation(
                "[GetTransactions] Filtering by dashboardName={DashboardName}",
                dashboardName);

            query = query.Where(t => t.DashboardName == dashboardName);
        }

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetTransactions] Returning {Count} transaction records",
            transactions.Count);

        return transactions;
    }

    public async Task<UserAddedTransaction> CreateTransactionAsync(
        string userId,
        UserAddedTransaction transaction,
        CancellationToken ct = default)
    {
        transaction.Id = Guid.NewGuid();
        transaction.UserId = userId;
        transaction.Date = transaction.Date.Date;

        _logger.LogInformation(
            "[CreateTransaction] Creating transaction. transactionId={TransactionId}, dashboard={DashboardName}, amount={Amount}",
            transaction.Id, transaction.DashboardName, transaction.Amount);

        _context.UserAddedTransactions.Add(transaction);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[CreateTransaction] Transaction created successfully");

        return transaction;
    }

    public async Task<UserAddedTransaction?> UpdateTransactionAsync(
        string userId,
        Guid transactionId,
        UserAddedTransaction updated,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[UpdateTransaction] Updating transaction. transactionId={TransactionId}",
            transactionId);

        var existing = await _context.UserAddedTransactions
            .FirstOrDefaultAsync(
                t => t.Id == transactionId && t.UserId == userId,
                ct);

        if (existing is null)
        {
            _logger.LogWarning(
                "[UpdateTransaction] Transaction not found. transactionId={TransactionId}",
                transactionId);

            return null;
        }

        existing.DashboardName = updated.DashboardName;
        existing.Date = updated.Date.Date;
        existing.Description = updated.Description;
        existing.Amount = updated.Amount;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[UpdateTransaction] Transaction updated successfully");

        return existing;
    }

    public async Task<bool> DeleteTransactionAsync(
        string userId,
        Guid transactionId,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[DeleteTransaction] Deleting transaction. transactionId={TransactionId}",
            transactionId);

        var entity = await _context.UserAddedTransactions
            .FirstOrDefaultAsync(
                t => t.Id == transactionId && t.UserId == userId,
                ct);

        if (entity is null)
        {
            _logger.LogWarning(
                "[DeleteTransaction] Transaction not found. transactionId={TransactionId}",
                transactionId);

            return false;
        }

        _context.UserAddedTransactions.Remove(entity);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[DeleteTransaction] Transaction deleted successfully");

        return true;
    }
}
