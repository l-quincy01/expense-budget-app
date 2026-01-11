using BudgetlyAI.Models.ReadModels.Dashboard;

namespace BudgetlyAI.Services.Dashboards;

public interface IDashboardQueryService
{
    Task<Dashboard?> GetByNameAsync(
        string userId,
        string dashboardName,
        CancellationToken ct);

    Task<IReadOnlyList<string>> GetDashboardNamesAsync(
        string userId,
        CancellationToken ct);
}
