using Microsoft.AspNetCore.Http;

namespace BudgetlyAI.Services.Dashboards;

public interface IDashboardService
{
    Task CreateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct);

    Task UpdateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct);

    Task DeleteDashboardAsync(
        string userId,
        string dashboardName,
        CancellationToken ct);
}
