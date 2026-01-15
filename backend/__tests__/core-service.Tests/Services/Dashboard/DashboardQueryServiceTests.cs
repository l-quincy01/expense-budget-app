using System.Reflection;
using BudgetlyAI.Models.ReadModels.Dashboard;
using BudgetlyAI.Services.Dashboards;
using BudgetlyAI.Services.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using DashboardModel = BudgetlyAI.Models.ReadModels.Dashboard.Dashboard;

namespace CoreService.Tests.Services.Dashboards;

public class DashboardQueryServiceTests
{
    [Fact]
    public async Task GetByNameAsync_ReturnsDashboardWhenFound()
    {
        var dashboard = new DashboardModel
        {
            Id = "abc",
            UserId = "user-1",
            Name = "dash"
        };

        var findMock = new Mock<IFindFluent<DashboardModel, DashboardModel>>();
        findMock.Setup(f => f.FirstOrDefaultAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(dashboard);

        var collection = new Mock<IMongoCollection<DashboardModel>>();
        collection.Setup(c => c.Find(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions>()))
            .Returns(findMock.Object);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        var result = await service.GetByNameAsync("user-1", "dash", CancellationToken.None);

        result.Should().BeSameAs(dashboard);
    }

    [Fact]
    public async Task GetByNameAsync_ReturnsNullWhenMissing()
    {
        var findMock = new Mock<IFindFluent<DashboardModel, DashboardModel>>();
        findMock.Setup(f => f.FirstOrDefaultAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((DashboardModel?)null);

        var collection = new Mock<IMongoCollection<DashboardModel>>();
        collection.Setup(c => c.Find(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions>()))
            .Returns(findMock.Object);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        var result = await service.GetByNameAsync("user-1", "dash", CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetDashboardNamesAsync_ProjectsNames()
    {
        var findMock = new Mock<IFindFluent<DashboardModel, DashboardModel>>();
        var projectionMock = new Mock<IFindFluent<DashboardModel, string>>();

        projectionMock.Setup(p => p.ToListAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<string> { "dash-1", "dash-2" });

        findMock.Setup(f => f.Project(It.IsAny<ProjectionDefinition<DashboardModel, string>>()))
            .Returns(projectionMock.Object);

        var collection = new Mock<IMongoCollection<DashboardModel>>();
        collection.Setup(c => c.Find(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions>()))
            .Returns(findMock.Object);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        var result = await service.GetDashboardNamesAsync("user-1", CancellationToken.None);

        result.Should().Equal("dash-1", "dash-2");
    }

    private static MongoDbService CreateMongoStub(IMongoCollection<DashboardModel> dashboards)
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

        var dbMock = new Mock<IMongoDatabase>();
        dbMock.Setup(d => d.GetCollection<DashboardModel>("dashboards", null))
            .Returns(dashboards);

        var field = typeof(MongoDbService).GetField("_db", BindingFlags.Instance | BindingFlags.NonPublic);
        field!.SetValue(mongo, dbMock.Object);

        return mongo;
    }
}
