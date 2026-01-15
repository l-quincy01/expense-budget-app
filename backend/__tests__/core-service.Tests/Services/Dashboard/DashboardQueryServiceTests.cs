using System.Reflection;
using BudgetlyAI.Services.Dashboards;
using BudgetlyAI.Services.Persistence;
using CoreService.Tests.Shared;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Moq;
using Xunit;
using DashboardModel = BudgetlyAI.Models.ReadModels.Dashboard.Dashboard;

namespace CoreService.Tests.Services.Dashboards;

public class DashboardQueryServiceTests
{
    [Fact]
    public async Task GetByNameAsync_ReturnsDashboardWhenFound()
    {
        // Arrange
        var dashboard = new DashboardModel
        {
            Id = "abc",
            UserId = "user-1",
            Name = "dash"
        };

        var cursor = new TestAsyncCursor<DashboardModel>(new[] { dashboard });

        var collection = new Mock<IMongoCollection<DashboardModel>>();


        collection.Setup(c => c.FindAsync<DashboardModel>(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions<DashboardModel, DashboardModel>?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cursor);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        // Act
        var result = await service.GetByNameAsync("user-1", "dash", CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("abc");
        result.UserId.Should().Be("user-1");
        result.Name.Should().Be("dash");
    }

    [Fact]
    public async Task GetByNameAsync_ReturnsNullWhenMissing()
    {
        // Arrange
        var cursor = new TestAsyncCursor<DashboardModel>(Array.Empty<DashboardModel>());

        var collection = new Mock<IMongoCollection<DashboardModel>>();

        collection.Setup(c => c.FindAsync<DashboardModel>(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions<DashboardModel, DashboardModel>?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cursor);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        // Act
        var result = await service.GetByNameAsync("user-1", "dash", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetDashboardNamesAsync_ProjectsNames()
    {
        // Arrange
        var cursor = new TestAsyncCursor<string>(new[] { "dash-1", "dash-2" });

        var collection = new Mock<IMongoCollection<DashboardModel>>();


        collection.Setup(c => c.FindAsync<string>(
                It.IsAny<FilterDefinition<DashboardModel>>(),
                It.IsAny<FindOptions<DashboardModel, string>?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cursor);

        var mongo = CreateMongoStub(collection.Object);
        var service = new DashboardQueryService(mongo, Mock.Of<ILogger<DashboardQueryService>>());

        // Act
        var result = await service.GetDashboardNamesAsync("user-1", CancellationToken.None);

        // Assert
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

        var mongo = new MongoDbService(config, Mock.Of<ILogger<MongoDbService>>());

        var dbMock = new Mock<IMongoDatabase>();
        dbMock.Setup(d => d.GetCollection<DashboardModel>("dashboards", null))
            .Returns(dashboards);

        var field = typeof(MongoDbService)
            .GetField("_db", BindingFlags.Instance | BindingFlags.NonPublic);

        field!.SetValue(mongo, dbMock.Object);

        return mongo;
    }
}
