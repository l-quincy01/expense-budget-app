

using BudgetlyAI.Models;

namespace BudgetlyAI.Services.Budgets;

public interface IBudgetService
{
    Task<IReadOnlyList<UserAddedBudget>> GetBudgetsAsync(
        string userId,
        string? dashboardName,
        CancellationToken ct = default);

    Task<UserAddedBudget> CreateBudgetAsync(
        string userId,
        UserAddedBudget budget,
        CancellationToken ct = default);

    Task<UserAddedBudget?> UpdateBudgetAsync(
        string userId,
        Guid budgetId,
        UserAddedBudget updated,
        CancellationToken ct = default);

    Task<bool> DeleteBudgetAsync(
        string userId,
        Guid budgetId,
        CancellationToken ct = default);
}
