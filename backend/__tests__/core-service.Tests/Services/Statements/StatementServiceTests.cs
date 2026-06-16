using BudgetlyAI.Contracts.Statements;
using BudgetlyAI.Data;
using BudgetlyAI.Models;
using BudgetlyAI.Services.Statements;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Statements;

public class StatementServiceTests
{
    [Fact]
    public async Task UploadAsync_CreatesQueuedStatementsAndPublishesEvents()
    {
        using var context = CreateContext();
        var storage = new FakeStatementFileStorage();
        var publisher = new FakeStatementEventPublisher();
        var service = CreateService(context, storage, publisher);
        var file = CreateFormFile("statement.pdf", "application/pdf", [1, 2, 3]);

        var result = await service.UploadAsync("user-1", "main", [file]);

        result.Statements.Should().ContainSingle();
        result.Statements[0].Status.Should().Be(StatementStatus.Queued);
        context.StatementUploads.Should().ContainSingle(s =>
            s.UserId == "user-1" &&
            s.DashboardName == "main" &&
            s.Status == StatementStatus.Queued);
        publisher.Messages.Should().ContainSingle(m =>
            m.StatementId == result.Statements[0].Id &&
            m.UserId == "user-1" &&
            m.DashboardName == "main");
    }

    [Fact]
    public async Task ListAsync_ReturnsOnlyCurrentUsersStatements()
    {
        using var context = CreateContext();
        context.StatementUploads.AddRange(
            CreateUpload("user-1", "main", StatementStatus.Queued),
            CreateUpload("user-2", "main", StatementStatus.Completed));
        await context.SaveChangesAsync();

        var service = CreateService(
            context,
            new FakeStatementFileStorage(),
            new FakeStatementEventPublisher());

        var result = await service.ListAsync("user-1");

        result.Should().ContainSingle();
        result[0].Status.Should().Be(StatementStatus.Queued);
    }

    [Fact]
    public async Task GetStatusAsync_ReturnsNullForDifferentUser()
    {
        using var context = CreateContext();
        var upload = CreateUpload("user-2", "main", StatementStatus.Queued);
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();

        var service = CreateService(
            context,
            new FakeStatementFileStorage(),
            new FakeStatementEventPublisher());

        var result = await service.GetStatusAsync("user-1", upload.Id);

        result.Should().BeNull();
    }

    private static BudgetsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BudgetsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new BudgetsDbContext(options);
    }

    private static StatementService CreateService(
        BudgetsDbContext context,
        IStatementFileStorage storage,
        IStatementEventPublisher publisher)
    {
        return new StatementService(
            context,
            storage,
            publisher,
            Mock.Of<ILogger<StatementService>>());
    }

    private static StatementUpload CreateUpload(
        string userId,
        string dashboardName,
        StatementStatus status)
    {
        return new StatementUpload
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DashboardName = dashboardName,
            FileName = "statement.pdf",
            StoredFilePath = "/tmp/statement.pdf",
            Status = status,
            UploadedAt = DateTime.UtcNow
        };
    }

    private static IFormFile CreateFormFile(string fileName, string contentType, byte[] bytes)
    {
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "pdfs", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private sealed class FakeStatementFileStorage : IStatementFileStorage
    {
        public List<string> DeletedPaths { get; } = [];

        public Task<string> SaveAsync(
            string userId,
            Guid statementId,
            IFormFile file,
            CancellationToken ct = default)
        {
            StatementFileStorage.ValidatePdf(file);
            return Task.FromResult($"/tmp/{userId}/{statementId:N}/{file.FileName}");
        }

        public Task DeleteIfExistsAsync(string storedFilePath, CancellationToken ct = default)
        {
            DeletedPaths.Add(storedFilePath);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeStatementEventPublisher : IStatementEventPublisher
    {
        public List<StatementUploaded> Messages { get; } = [];

        public Task PublishAsync(StatementUploaded message, CancellationToken ct = default)
        {
            Messages.Add(message);
            return Task.CompletedTask;
        }
    }
}
