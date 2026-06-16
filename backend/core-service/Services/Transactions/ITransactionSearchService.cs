namespace BudgetlyAI.Services.Transactions;

public interface ITransactionSearchService
{
    Task<TransactionSearchResponseDto> SearchAsync(
        string userId,
        TransactionSearchRequest request,
        CancellationToken ct = default);
}
