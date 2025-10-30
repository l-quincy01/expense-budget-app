public class TransactionService(ITransactionRepository repo) : ITransactionService
{
    public Task<List<Transaction>> GetByUser(string userId) => repo.GetByUser(userId);
    public Task<Transaction> Create(Transaction tx) => repo.Create(tx);
}