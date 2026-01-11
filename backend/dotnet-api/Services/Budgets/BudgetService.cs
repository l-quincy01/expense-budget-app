
using BudgetlyAI.Data;
using BudgetlyAI.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Services.Budgets;

public class BudgetService : IBudgetService
{
    private readonly BudgetsDbContext _context;
    private readonly ILogger<BudgetService> _logger;

    public BudgetService(
        BudgetsDbContext context,
        ILogger<BudgetService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<UserAddedBudget>> GetBudgetsAsync(
        string userId,
        string? dashboardName,
        CancellationToken ct = default)
    {
        _logger.LogInformation("[GetBudgets] Fetching budgets for userId={UserId}", userId);

        var query = _context.UserAddedBudgets.Where(b => b.UserId == userId);

        if (!string.IsNullOrWhiteSpace(dashboardName))
        {
            _logger.LogInformation(
                "[GetBudgets] Filtering by dashboardName={DashboardName}",
                dashboardName);

            query = query.Where(b => b.DashboardName == dashboardName);
        }

        var budgets = await query
            .OrderBy(b => b.Category)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetBudgets] Returning {Count} budget records",
            budgets.Count);

        return budgets;
    }

    public async Task<UserAddedBudget> CreateBudgetAsync(
        string userId,
        UserAddedBudget budget,
        CancellationToken ct = default)
    {
        budget.Id = Guid.NewGuid();
        budget.UserId = userId;

        _logger.LogInformation(
            "[CreateBudget] Creating budget. budgetId={BudgetId}, category={Category}, dashboard={DashboardName}",
            budget.Id, budget.Category, budget.DashboardName);

        _context.UserAddedBudgets.Add(budget);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[CreateBudget] Budget created successfully");

        return budget;
    }

    public async Task<UserAddedBudget?> UpdateBudgetAsync(
        string userId,
        Guid budgetId,
        UserAddedBudget updated,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[UpdateBudget] Updating budget. budgetId={BudgetId}",
            budgetId);

        var existing = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(
                b => b.Id == budgetId && b.UserId == userId,
                ct);

        if (existing is null)
        {
            _logger.LogWarning(
                "[UpdateBudget] Budget not found. budgetId={BudgetId}",
                budgetId);

            return null;
        }

        _logger.LogInformation(
            "[UpdateBudget] Updating budget. category={Category}, dashboard={DashboardName}",
            updated.Category, updated.DashboardName);

        existing.DashboardName = updated.DashboardName;
        existing.Category = updated.Category;
        existing.BudgetAmount = updated.BudgetAmount;
        existing.SpentAmount = updated.SpentAmount;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[UpdateBudget] Budget updated successfully");

        return existing;
    }

    public async Task<bool> DeleteBudgetAsync(
        string userId,
        Guid budgetId,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[DeleteBudget] Deleting budget. budgetId={BudgetId}",
            budgetId);

        var entity = await _context.UserAddedBudgets
            .FirstOrDefaultAsync(
                b => b.Id == budgetId && b.UserId == userId,
                ct);

        if (entity is null)
        {
            _logger.LogWarning(
                "[DeleteBudget] Budget not found. budgetId={BudgetId}",
                budgetId);

            return false;
        }

        _logger.LogInformation(
            "[DeleteBudget] Deleting budget. category={Category}, dashboard={Dashboard}",
            entity.Category, entity.DashboardName);

        _context.UserAddedBudgets.Remove(entity);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("[DeleteBudget] Budget deleted successfully");

        return true;
    }
}
