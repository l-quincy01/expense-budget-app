using BudgetlyAI.Contracts.Statements;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StatementWorker.Consumers;
using StatementWorker.Data;

namespace CoreService.Tests.Services.Statements;

public class StatementUploadedConsumerTests
{
    [Fact]
    public async Task Consume_MarksQueuedStatementCompleted()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();

        var consumer = new StatementUploadedConsumer(
            context,
            Mock.Of<ILogger<StatementUploadedConsumer>>());
        var message = new StatementUploaded(
            upload.Id,
            upload.UserId,
            upload.DashboardName,
            upload.FileName,
            upload.StoredFilePath,
            upload.UploadedAt);

        await consumer.Consume(CreateConsumeContext(message));

        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.Completed);
        saved.ProcessedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Consume_MissingStatementDoesNotCreateRecord()
    {
        using var context = CreateContext();
        var consumer = new StatementUploadedConsumer(
            context,
            Mock.Of<ILogger<StatementUploadedConsumer>>());
        var message = new StatementUploaded(
            Guid.NewGuid(),
            "user-1",
            "main",
            "statement.pdf",
            "/tmp/statement.pdf",
            DateTime.UtcNow);

        await consumer.Consume(CreateConsumeContext(message));

        context.StatementUploads.Should().BeEmpty();
    }

    private static ConsumeContext<StatementUploaded> CreateConsumeContext(
        StatementUploaded message)
    {
        var consumeContext = new Mock<ConsumeContext<StatementUploaded>>();
        consumeContext.SetupGet(c => c.Message).Returns(message);
        consumeContext.SetupGet(c => c.CancellationToken).Returns(CancellationToken.None);
        return consumeContext.Object;
    }

    private static StatementWorkerDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<StatementWorkerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new StatementWorkerDbContext(options);
    }

    private static StatementUploadRecord CreateUpload()
    {
        return new StatementUploadRecord
        {
            Id = Guid.NewGuid(),
            UserId = "user-1",
            DashboardName = "main",
            FileName = "statement.pdf",
            StoredFilePath = "/tmp/statement.pdf",
            Status = StatementStatus.Queued,
            UploadedAt = DateTime.UtcNow
        };
    }
}
