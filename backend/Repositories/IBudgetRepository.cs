public interface IBudgetRepository
{
    Task<List<Budget>> GetUserBudgets(string userId, DateTime month);
    Task<Budget?> GetById(int id);
    Task<Budget> Create(Budget budget);
    Task<Budget> Update(Budget budget);
    Task Delete(int id, string userId);
}