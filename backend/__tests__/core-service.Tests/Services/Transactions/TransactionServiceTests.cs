using BudgetlyAI.Data;
using BudgetlyAI.Models;
using BudgetlyAI.Services.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Transactions;

public class TransactionServiceTests
{
    private static BudgetsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BudgetsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new BudgetsDbContext(options);
    }

    private static TransactionService CreateService(BudgetsDbContext context)
    {
        var logger = Mock.Of<ILogger<TransactionService>>();
        return new TransactionService(context, logger);
    }

    [Fact]
    public async Task GetTransactionsAsync_FiltersByUserAndDashboard_OrdersByDateThenId()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var userId = "user-1";
        var dashboard = "dash-1";

        var newer = new UserAddedTransaction
        {
            Id = new Guid("00000000-0000-0000-0000-0000000000AA"),
            UserId = userId,
            DashboardName = dashboard,
            Date = new DateTime(2024, 2, 2),
            Description = "newer",
            Amount = 10m
        };

        var earlier = new UserAddedTransaction
        {
            Id = new Guid("00000000-0000-0000-0000-0000000000BB"),
            UserId = userId,
            DashboardName = dashboard,
            Date = new DateTime(2024, 1, 1),
            Description = "earlier",
            Amount = 20m
        };

        var sameDateHigherId = new UserAddedTransaction
        {
            Id = new Guid("00000000-0000-0000-0000-0000000000CC"),
            UserId = userId,
            DashboardName = dashboard,
            Date = new DateTime(2024, 1, 1),
            Description = "same date higher id",
            Amount = 30m
        };

        var otherDashboard = new UserAddedTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DashboardName = "dash-2",
            Date = new DateTime(2024, 1, 3),
            Description = "other dash",
            Amount = 5m
        };

        var otherUser = new UserAddedTransaction
        {
            Id = Guid.NewGuid(),
            UserId = "user-2",
            DashboardName = dashboard,
            Date = new DateTime(2024, 1, 4),
            Description = "other user",
            Amount = 5m
        };

        context.UserAddedTransactions.AddRange(
            newer,
            earlier,
            sameDateHigherId,
            otherDashboard,
            otherUser);

        await context.SaveChangesAsync();

        var result = await service.GetTransactionsAsync(userId, dashboard);

        result.Should().HaveCount(3);
        result.Select(t => t.Id).Should().ContainInOrder(
            newer.Id,
            sameDateHigherId.Id,
            earlier.Id);
        result.Should().OnlyContain(t =>
            t.UserId == userId && t.DashboardName == dashboard);
    }

    [Fact]
    public async Task CreateTransactionAsync_SetsIdUserIdAndTruncatesDate()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var input = new UserAddedTransaction
        {
            DashboardName = "main",
            Date = new DateTime(2024, 5, 1, 13, 45, 0),
            Description = "Lunch",
            Amount = 12.5m
        };

        var created = await service.CreateTransactionAsync("user-123", input);

        created.Id.Should().NotBe(Guid.Empty);
        created.UserId.Should().Be("user-123");
        created.Date.TimeOfDay.Should().Be(TimeSpan.Zero);

        context.UserAddedTransactions.Should().ContainSingle();
        var saved = context.UserAddedTransactions.Single();
        saved.Should().BeEquivalentTo(created);
    }

    [Fact]
    public async Task UpdateTransactionAsync_ReturnsNullWhenNotFound()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.UpdateTransactionAsync(
            "user-1",
            Guid.NewGuid(),
            new UserAddedTransaction
            {
                DashboardName = "dash",
                Date = DateTime.UtcNow,
                Description = "desc",
                Amount = 1m
            });

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateTransactionAsync_UpdatesFieldsAndTruncatesDate()
    {
        using var context = CreateContext();
        var existingId = Guid.NewGuid();

        context.UserAddedTransactions.Add(new UserAddedTransaction
        {
            Id = existingId,
            UserId = "user-1",
            DashboardName = "old-dash",
            Date = new DateTime(2024, 1, 1),
            Description = "old description",
            Amount = 10m
        });

        await context.SaveChangesAsync();

        var service = CreateService(context);

        var updated = new UserAddedTransaction
        {
            DashboardName = "new-dash",
            Date = new DateTime(2024, 3, 15, 9, 30, 0),
            Description = "new description",
            Amount = 55.25m
        };

        var result = await service.UpdateTransactionAsync(
            "user-1",
            existingId,
            updated);

        result.Should().NotBeNull();
        result!.DashboardName.Should().Be("new-dash");
        result.Date.TimeOfDay.Should().Be(TimeSpan.Zero);
        result.Description.Should().Be("new description");
        result.Amount.Should().Be(55.25m);

        var saved = await context.UserAddedTransactions.FindAsync(existingId);
        saved.Should().NotBeNull();
        saved!.DashboardName.Should().Be("new-dash");
        saved.Date.TimeOfDay.Should().Be(TimeSpan.Zero);
        saved.Description.Should().Be("new description");
        saved.Amount.Should().Be(55.25m);
    }

    [Fact]
    public async Task DeleteTransactionAsync_ReturnsFalseWhenNotFound()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.DeleteTransactionAsync("user-1", Guid.NewGuid());

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTransactionAsync_RemovesEntity()
    {
        using var context = CreateContext();
        var service = CreateService(context);
        var transactionId = Guid.NewGuid();

        context.UserAddedTransactions.Add(new UserAddedTransaction
        {
            Id = transactionId,
            UserId = "user-1",
            DashboardName = "main",
            Date = new DateTime(2024, 1, 1),
            Description = "Coffee",
            Amount = 5m
        });

        await context.SaveChangesAsync();

        var result = await service.DeleteTransactionAsync("user-1", transactionId);

        result.Should().BeTrue();
        context.UserAddedTransactions.ToList().Should().BeEmpty();
    }
}
