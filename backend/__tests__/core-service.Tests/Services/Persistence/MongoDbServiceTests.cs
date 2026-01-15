using BudgetlyAI.Services.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Persistence;

public class MongoDbServiceTests
{
    [Fact]
    public void Constructor_InitializesCollectionsWithConfiguredNames()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MongoDb:ConnectionString"] = "mongodb://localhost:27017",
                ["MongoDb:DatabaseName"] = "testdb"
            })
            .Build();

        var service = new MongoDbService(
            config,
            Mock.Of<ILogger<MongoDbService>>());

        service.Budgets.CollectionNamespace.CollectionName.Should().Be("budgets");
        service.MonthlyTransactions.CollectionNamespace.CollectionName.Should().Be("monthlyTransactions");
        service.MonthlyIncomeExpenses.CollectionNamespace.CollectionName.Should().Be("monthlyIncomeExpenses");
        service.MonthlyCategoryExpenditures.CollectionNamespace.CollectionName.Should().Be("monthlyCategoryExpenditures");
        service.Dashboards.CollectionNamespace.CollectionName.Should().Be("dashboards");
    }
}
