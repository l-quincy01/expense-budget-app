using Microsoft.AspNetCore.Http;

namespace BudgetlyAI.Services.Ingest;

public interface INodeIngestClient
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
}
