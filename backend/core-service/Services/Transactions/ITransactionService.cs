

using BudgetlyAI.Models;

namespace BudgetlyAI.Services.Transactions;

public interface ITransactionService
{
    Task<IReadOnlyList<UserAddedTransaction>> GetTransactionsAsync(
        string userId,
        string? dashboardName,
        CancellationToken ct = default);

    Task<UserAddedTransaction> CreateTransactionAsync(
        string userId,
        UserAddedTransaction transaction,
        CancellationToken ct = default);

    Task<UserAddedTransaction?> UpdateTransactionAsync(
        string userId,
        Guid transactionId,
        UserAddedTransaction updated,
        CancellationToken ct = default);

    Task<bool> DeleteTransactionAsync(
        string userId,
        Guid transactionId,
        CancellationToken ct = default);
}
