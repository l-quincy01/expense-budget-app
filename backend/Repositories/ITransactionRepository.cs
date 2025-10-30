public interface ITransactionRepository
{
    Task<List<Transaction>> GetByUser(string userId, DateTime? from = null, DateTime? to = null);
    Task<List<Transaction>> GetByBudget(int budgetId, string userId);
    Task<Transaction> Create(Transaction tx);
    Task Delete(int id, string userId);
}