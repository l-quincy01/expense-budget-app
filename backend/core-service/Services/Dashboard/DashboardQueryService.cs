using BudgetlyAI.Models.ReadModels.Dashboard;
using BudgetlyAI.Services.Persistence;
using MongoDB.Driver;

namespace BudgetlyAI.Services.Dashboards;

public class DashboardQueryService : IDashboardQueryService
{
    private readonly MongoDbService _mongo;
    private readonly ILogger<DashboardQueryService> _logger;

    public DashboardQueryService(
        MongoDbService mongo,
        ILogger<DashboardQueryService> logger)
    {
        _mongo = mongo;
        _logger = logger;
    }

    public async Task<Dashboard?> GetByNameAsync(
        string userId,
        string dashboardName,
        CancellationToken ct)
    {
        _logger.LogInformation(
            "[GetDashboardByName] Querying MongoDB. userId={UserId}, name={Name}",
            userId,
            dashboardName);

        var filter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, dashboardName)
        );

        var dashboard = await _mongo.Dashboards
            .Find(filter)
            .FirstOrDefaultAsync(ct);

        if (dashboard is null)
        {
            _logger.LogWarning(
                "[GetDashboardByName] Dashboard not found. name={Name}",
                dashboardName);
        }
        else
        {
            _logger.LogInformation(
                "[GetDashboardByName] Dashboard found. dashboardId={Id}",
                dashboard.Id);
        }

        return dashboard;
    }

    public async Task<IReadOnlyList<string>> GetDashboardNamesAsync(
        string userId,
        CancellationToken ct)
    {
        _logger.LogInformation(
            "[GetDashboardNames] Querying MongoDB for dashboard names. userId={UserId}",
            userId);

        var filter = Builders<Dashboard>.Filter.Eq(d => d.UserId, userId);

        var names = await _mongo.Dashboards
            .Find(filter)
            .Project(d => d.Name)
            .ToListAsync(ct);

        _logger.LogInformation(
            "[GetDashboardNames] Retrieved {Count} dashboard names",
            names.Count);

        return names;
    }
}
