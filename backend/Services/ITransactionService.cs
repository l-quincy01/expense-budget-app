public interface ITransactionService
{
    Task<List<Transaction>> GetByUser(string userId);
    Task<Transaction> Create(Transaction tx);
}

