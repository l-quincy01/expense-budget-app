public class BudgetService(IBudgetRepository budgets, ITransactionRepository txs) : IBudgetService
{
    public async Task<List<BudgetDto>> GetUserBudgets(string userId, DateTime month)
    {
        var bs = await budgets.GetUserBudgets(userId, month);
        var results = new List<BudgetDto>();
        foreach (var b in bs)
        {
            var tlist = await txs.GetByBudget(b.Id, userId);
            var spent = tlist.Where(t => t.Type == "Expense").Sum(t => t.Amount);
            var remaining = Math.Max(0, b.BudgetAmount - spent);
            results.Add(new BudgetDto(b.Id, b.Category, b.BudgetAmount, spent, remaining, b.Month));
        }
        return results;
    }

    public Task<Budget> Create(Budget budget) => budgets.Create(budget);
}