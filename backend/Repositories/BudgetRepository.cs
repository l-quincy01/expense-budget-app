using Microsoft.EntityFrameworkCore;

public class BudgetRepository(ApplicationDbContext db) : IBudgetRepository
{
    public Task<List<Budget>> GetUserBudgets(string userId, DateTime month) =>
      db.Budgets.Where(b => b.UserId == userId && b.Month == month).ToListAsync();

    public Task<Budget?> GetById(int id) => db.Budgets.FindAsync(id).AsTask();

    public async Task<Budget> Create(Budget budget)
    {
        db.Budgets.Add(budget); await db.SaveChangesAsync(); return budget;
    }

    public async Task<Budget> Update(Budget budget)
    {
        db.Budgets.Update(budget); await db.SaveChangesAsync(); return budget;
    }

    public async Task Delete(int id, string userId)
    {
        var b = await db.Budgets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (b is null) return; db.Budgets.Remove(b); await db.SaveChangesAsync();
    }
}

