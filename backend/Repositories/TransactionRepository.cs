using Microsoft.EntityFrameworkCore;

public class TransactionRepository(ApplicationDbContext db) : ITransactionRepository
{
    public Task<List<Transaction>> GetByUser(string userId, DateTime? from = null, DateTime? to = null)
    {
        var q = db.Transactions.Where(t => t.UserId == userId);
        if (from.HasValue) q = q.Where(t => t.TransactionDate >= from.Value);
        if (to.HasValue) q = q.Where(t => t.TransactionDate <= to.Value);
        return q.OrderByDescending(t => t.TransactionDate).ToListAsync();
    }

    public Task<List<Transaction>> GetByBudget(int budgetId, string userId) =>
      db.Transactions.Where(t => t.BudgetId == budgetId && t.UserId == userId)
                     .OrderByDescending(t => t.TransactionDate)
                     .ToListAsync();

    public async Task<Transaction> Create(Transaction tx)
    {
        db.Transactions.Add(tx); await db.SaveChangesAsync(); return tx;
    }

    public async Task Delete(int id, string userId)
    {
        var t = await db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (t is null) return; db.Transactions.Remove(t); await db.SaveChangesAsync();
    }
}