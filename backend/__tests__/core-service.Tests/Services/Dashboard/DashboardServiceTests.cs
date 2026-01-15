using System.Reflection;
using BudgetlyAI.Models;
using BudgetlyAI.Models.ReadModels.Dashboard;
using BudgetlyAI.Services.Dashboards;
using BudgetlyAI.Services.Ingest;
using BudgetlyAI.Services.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using DashboardModel = BudgetlyAI.Models.ReadModels.Dashboard.Dashboard;

namespace CoreService.Tests.Services.Dashboards;

public class DashboardServiceTests
{
    [Fact]
    public async Task CreateDashboardAsync_ForwardsToIngestClient()
    {
        var ingest = new Mock<INodeIngestClient>();
        var mongo = CreateMongoStub();
        var logger = Mock.Of<ILogger<DashboardService>>();
        var service = new DashboardService(ingest.Object, mongo, logger);
        var pdfs = Array.Empty<IFormFile>();
        var ct = new CancellationTokenSource().Token;

        await service.CreateDashboardAsync("user-1", "dash", pdfs, ct);

        ingest.Verify(c =>
            c.CreateDashboardAsync("user-1", "dash", pdfs, ct),
            Times.Once);
    }

    [Fact]
    public async Task UpdateDashboardAsync_ForwardsToIngestClient()
    {
        var ingest = new Mock<INodeIngestClient>();
        var mongo = CreateMongoStub();
        var logger = Mock.Of<ILogger<DashboardService>>();
        var service = new DashboardService(ingest.Object, mongo, logger);
        var pdfs = Array.Empty<IFormFile>();
        var ct = new CancellationTokenSource().Token;

        await service.UpdateDashboardAsync("user-2", "dash-2", pdfs, ct);

        ingest.Verify(c =>
            c.UpdateDashboardAsync("user-2", "dash-2", pdfs, ct),
            Times.Once);
    }

    [Fact]
    public async Task DeleteDashboardAsync_DeletesAndCleansRelatedCollections()
    {
        var dashboardCollection = new Mock<IMongoCollection<DashboardModel>>();
        dashboardCollection
            .Setup(c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MockDeleteResult(1));

        var monthlyTransactions = new Mock<IMongoCollection<UserMonthlyTransaction>>();
        monthlyTransactions
            .Setup(c => c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyTransaction>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MockDeleteResult(2));

        var incomeExpenses = new Mock<IMongoCollection<UserMonthlyIncomeExpense>>();
        incomeExpenses
            .Setup(c => c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyIncomeExpense>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MockDeleteResult(3));

        var categoryExpenditures = new Mock<IMongoCollection<UserMonthlyCategoryExpenditure>>();
        categoryExpenditures
            .Setup(c => c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyCategoryExpenditure>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MockDeleteResult(4));

        var mongo = CreateMongoStub(
            dashboardCollection.Object,
            monthlyTransactions.Object,
            incomeExpenses.Object,
            categoryExpenditures.Object);

        var service = new DashboardService(
            Mock.Of<INodeIngestClient>(),
            mongo,
            Mock.Of<ILogger<DashboardService>>());

        await service.DeleteDashboardAsync("user-1", "dash%201", CancellationToken.None);

        dashboardCollection.Verify(c =>
            c.DeleteOneAsync(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        monthlyTransactions.Verify(c =>
            c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyTransaction>>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        incomeExpenses.Verify(c =>
            c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyIncomeExpense>>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        categoryExpenditures.Verify(c =>
            c.DeleteManyAsync(
                It.IsAny<FilterDefinition<UserMonthlyCategoryExpenditure>>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteDashboardAsync_ThrowsWhenDashboardNotFound()
    {
        var dashboardCollection = new Mock<IMongoCollection<DashboardModel>>();
        dashboardCollection
            .Setup(c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MockDeleteResult(0));

        var mongo = CreateMongoStub(
            dashboardCollection.Object,
            new Mock<IMongoCollection<UserMonthlyTransaction>>().Object,
            new Mock<IMongoCollection<UserMonthlyIncomeExpense>>().Object,
            new Mock<IMongoCollection<UserMonthlyCategoryExpenditure>>().Object);

        var service = new DashboardService(
            Mock.Of<INodeIngestClient>(),
            mongo,
            Mock.Of<ILogger<DashboardService>>());

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.DeleteDashboardAsync("user-1", "dash", CancellationToken.None));
    }

    private static MongoDbService CreateMongoStub(
        IMongoCollection<DashboardModel>? dashboards = null,
        IMongoCollection<UserMonthlyTransaction>? monthlyTransactions = null,
        IMongoCollection<UserMonthlyIncomeExpense>? incomeExpenses = null,
        IMongoCollection<UserMonthlyCategoryExpenditure>? categoryExpenditures = null)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MongoDb:ConnectionString"] = "mongodb://localhost:27017",
                ["MongoDb:DatabaseName"] = "testdb"
            })
            .Build();

        var mongo = new MongoDbService(
            config,
            Mock.Of<ILogger<MongoDbService>>());

        dashboards ??= new Mock<IMongoCollection<DashboardModel>>().Object;
        monthlyTransactions ??= new Mock<IMongoCollection<UserMonthlyTransaction>>().Object;
        incomeExpenses ??= new Mock<IMongoCollection<UserMonthlyIncomeExpense>>().Object;
        categoryExpenditures ??= new Mock<IMongoCollection<UserMonthlyCategoryExpenditure>>().Object;

        var dbMock = new Mock<IMongoDatabase>();
        dbMock.Setup(d => d.GetCollection<DashboardModel>("dashboards", null))
            .Returns(dashboards);
        dbMock.Setup(d => d.GetCollection<UserMonthlyTransaction>("monthlyTransactions", null))
            .Returns(monthlyTransactions);
        dbMock.Setup(d => d.GetCollection<UserMonthlyIncomeExpense>("monthlyIncomeExpenses", null))
            .Returns(incomeExpenses);
        dbMock.Setup(d => d.GetCollection<UserMonthlyCategoryExpenditure>("monthlyCategoryExpenditures", null))
            .Returns(categoryExpenditures);

        var field = typeof(MongoDbService).GetField("_db", BindingFlags.Instance | BindingFlags.NonPublic);
        field!.SetValue(mongo, dbMock.Object);

        return mongo;
    }

    private static DeleteResult MockDeleteResult(long deletedCount)
    {
        return Mock.Of<DeleteResult>(r => r.DeletedCount == deletedCount && r.IsAcknowledged);
    }
}
