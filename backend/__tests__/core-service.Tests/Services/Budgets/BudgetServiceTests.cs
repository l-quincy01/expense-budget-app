using BudgetlyAI.Data;
using BudgetlyAI.Models;
using BudgetlyAI.Services.Budgets;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Budgets;

public class BudgetServiceTests
{
    private static BudgetsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BudgetsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new BudgetsDbContext(options);
    }

    private static BudgetService CreateService(BudgetsDbContext context)
    {
        var logger = Mock.Of<ILogger<BudgetService>>();
        return new BudgetService(context, logger);
    }

    [Fact]
    public async Task GetBudgetsAsync_FiltersByUserAndDashboard_OrdersByCategory()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var userId = "user-1";
        var dashboard = "dash-1";

        var groceries = new UserAddedBudget
        {
            Id = new Guid("00000000-0000-0000-0000-000000000001"),
            UserId = userId,
            DashboardName = dashboard,
            Category = "Groceries",
            BudgetAmount = 100,
            SpentAmount = 10
        };

        var rent = new UserAddedBudget
        {
            Id = new Guid("00000000-0000-0000-0000-000000000002"),
            UserId = userId,
            DashboardName = dashboard,
            Category = "Rent",
            BudgetAmount = 500,
            SpentAmount = 300
        };

        var otherDashboard = new UserAddedBudget
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DashboardName = "dash-2",
            Category = "Misc",
            BudgetAmount = 50,
            SpentAmount = 5
        };

        var otherUser = new UserAddedBudget
        {
            Id = Guid.NewGuid(),
            UserId = "user-2",
            DashboardName = dashboard,
            Category = "Travel",
            BudgetAmount = 200,
            SpentAmount = 20
        };

        context.UserAddedBudgets.AddRange(
            rent,
            groceries,
            otherDashboard,
            otherUser);

        await context.SaveChangesAsync();

        var result = await service.GetBudgetsAsync(userId, dashboard);

        result.Should().HaveCount(2);
        result.Select(b => b.Id).Should().ContainInOrder(
            groceries.Id,
            rent.Id);
        result.Should().OnlyContain(b =>
            b.UserId == userId && b.DashboardName == dashboard);
    }

    [Fact]
    public async Task CreateBudgetAsync_AssignsIdAndUser()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var input = new UserAddedBudget
        {
            DashboardName = "main",
            Category = "Food",
            BudgetAmount = 250,
            SpentAmount = 0
        };

        var created = await service.CreateBudgetAsync("user-123", input);

        created.Id.Should().NotBe(Guid.Empty);
        created.UserId.Should().Be("user-123");
        context.UserAddedBudgets.Should().ContainSingle();
        context.UserAddedBudgets.Single().Should().BeEquivalentTo(created);
    }

    [Fact]
    public async Task UpdateBudgetAsync_ReturnsNullWhenNotFound()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.UpdateBudgetAsync(
            "user-1",
            Guid.NewGuid(),
            new UserAddedBudget
            {
                DashboardName = "dash",
                Category = "Cat",
                BudgetAmount = 10,
                SpentAmount = 1
            });

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateBudgetAsync_UpdatesFields()
    {
        using var context = CreateContext();
        var existingId = Guid.NewGuid();

        context.UserAddedBudgets.Add(new UserAddedBudget
        {
            Id = existingId,
            UserId = "user-1",
            DashboardName = "old-dash",
            Category = "Old",
            BudgetAmount = 100,
            SpentAmount = 20
        });

        await context.SaveChangesAsync();

        var service = CreateService(context);

        var updated = new UserAddedBudget
        {
            DashboardName = "new-dash",
            Category = "New",
            BudgetAmount = 300,
            SpentAmount = 30
        };

        var result = await service.UpdateBudgetAsync(
            "user-1",
            existingId,
            updated);

        result.Should().NotBeNull();
        result!.DashboardName.Should().Be("new-dash");
        result.Category.Should().Be("New");
        result.BudgetAmount.Should().Be(300);
        result.SpentAmount.Should().Be(30);

        var saved = await context.UserAddedBudgets.FindAsync(existingId);
        saved.Should().NotBeNull();
        saved!.DashboardName.Should().Be("new-dash");
        saved.Category.Should().Be("New");
        saved.BudgetAmount.Should().Be(300);
        saved.SpentAmount.Should().Be(30);
    }

    [Fact]
    public async Task DeleteBudgetAsync_ReturnsFalseWhenNotFound()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.DeleteBudgetAsync("user-1", Guid.NewGuid());

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteBudgetAsync_RemovesEntity()
    {
        using var context = CreateContext();
        var service = CreateService(context);
        var budgetId = Guid.NewGuid();

        context.UserAddedBudgets.Add(new UserAddedBudget
        {
            Id = budgetId,
            UserId = "user-1",
            DashboardName = "main",
            Category = "Food",
            BudgetAmount = 100,
            SpentAmount = 10
        });

        await context.SaveChangesAsync();

        var result = await service.DeleteBudgetAsync("user-1", budgetId);

        result.Should().BeTrue();
        context.UserAddedBudgets.Should().BeEmpty();
    }
}
