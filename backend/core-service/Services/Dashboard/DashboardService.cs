using BudgetlyAI.Models;
using BudgetlyAI.Models.ReadModels.Dashboard;
using BudgetlyAI.Services.Ingest;
using BudgetlyAI.Services.Persistence;
using MongoDB.Driver;

namespace BudgetlyAI.Services.Dashboards;

public class DashboardService : IDashboardService
{
    private readonly INodeIngestClient _nodeIngest;
    private readonly MongoDbService _mongo;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        INodeIngestClient nodeIngest,
        MongoDbService mongo,
        ILogger<DashboardService> logger)
    {
        _nodeIngest = nodeIngest;
        _mongo = mongo;
        _logger = logger;
    }

    public async Task CreateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[CreateDashboard] userId={UserId}", userId);
        _logger.LogInformation("[CreateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[CreateDashboard] pdfCount={Count}", pdfs.Length);

        await _nodeIngest.CreateDashboardAsync(
            userId,
            dashboardName,
            pdfs,
            ct);

        _logger.LogInformation("[CreateDashboard] Dashboard successfully created");
    }

    public async Task UpdateDashboardAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct)
    {
        _logger.LogInformation("[UpdateDashboard] dashboardName={DashboardName}", dashboardName);
        _logger.LogInformation("[UpdateDashboard] pdfCount={Count}", pdfs.Length);

        await _nodeIngest.UpdateDashboardAsync(
            userId,
            dashboardName,
            pdfs,
            ct);

        _logger.LogInformation("[UpdateDashboard] Dashboard updated successfully");
    }

    public async Task DeleteDashboardAsync(
        string userId,
        string dashboardName,
        CancellationToken ct)
    {
        var decodedName = Uri.UnescapeDataString(dashboardName);

        _logger.LogInformation(
            "[DeleteDashboard] decodedDashboardName={Decoded}",
            decodedName);

        var dashboardFilter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.UserId, userId),
            Builders<Dashboard>.Filter.Eq(d => d.Name, decodedName)
        );

        _logger.LogInformation("[DeleteDashboard] Deleting dashboard record");

        var deleteResult = await _mongo.Dashboards
            .DeleteOneAsync(dashboardFilter, cancellationToken: ct);

        if (deleteResult.DeletedCount == 0)
        {
            _logger.LogWarning("[DeleteDashboard] Dashboard not found");
            throw new KeyNotFoundException("Dashboard not found");
        }

        _logger.LogInformation("[DeleteDashboard] Deleted 1 dashboard record");
        _logger.LogInformation("[DeleteDashboard] Cleaning related collections");

        await _mongo.MonthlyTransactions.DeleteManyAsync(
            Builders<UserMonthlyTransaction>.Filter.And(
                Builders<UserMonthlyTransaction>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyTransaction>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        await _mongo.MonthlyIncomeExpenses.DeleteManyAsync(
            Builders<UserMonthlyIncomeExpense>.Filter.And(
                Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyIncomeExpense>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        await _mongo.MonthlyCategoryExpenditures.DeleteManyAsync(
            Builders<UserMonthlyCategoryExpenditure>.Filter.And(
                Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.UserId, userId),
                Builders<UserMonthlyCategoryExpenditure>.Filter.Eq(t => t.DashboardName, decodedName)
            ),
            cancellationToken: ct);

        _logger.LogInformation("[DeleteDashboard] Dashboard and all related data deleted");
    }
}
