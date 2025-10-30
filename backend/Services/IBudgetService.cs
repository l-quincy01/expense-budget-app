public record BudgetDto(int Id, string Category, decimal BudgetAmount, decimal SpentAmount, decimal RemainingAmount, DateTime Month);

public interface IBudgetService
{
    Task<List<BudgetDto>> GetUserBudgets(string userId, DateTime month);
    Task<Budget> Create(Budget budget);
}