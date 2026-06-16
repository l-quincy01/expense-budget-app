using BudgetlyAI.Contracts.Statements;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StatementWorker.Consumers;
using StatementWorker.Data;
using StatementWorker.Extraction;
using StatementWorker.Processing;
using StatementWorker.Retry;

namespace CoreService.Tests.Services.Statements;

public class StatementUploadedConsumerTests
{
    [Fact]
    public async Task Consume_SuccessfulExtractionWritesRowsUpdatesDashboardAndMarksCompleted()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient { Result = CreateValidExtractionResult() };
        var dashboardWriter = new FakeDashboardWriter();
        var indexer = new FakeTransactionSearchIndexer();
        var cacheInvalidator = new FakeCacheInvalidator();

        var consumer = CreateConsumer(context, aiClient, dashboardWriter, indexer, cacheInvalidator);
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
        saved.ErrorMessage.Should().BeNull();
        context.ExtractedTransactions.Should().ContainSingle(t =>
            t.StatementUploadId == upload.Id &&
            t.UserId == upload.UserId &&
            t.DashboardName == upload.DashboardName &&
            t.Description == "Extracted statement transaction" &&
            t.Date == new DateTime(2026, 1, 12));
        dashboardWriter.Upserts.Should().ContainSingle(u => u.UploadId == upload.Id);
        indexer.Indexed.Should().ContainSingle(batch => batch.Count == 1);
        cacheInvalidator.UserIds.Should().ContainSingle().Which.Should().Be(upload.UserId);
        aiClient.Calls.Should().ContainSingle(u => u.Id == upload.Id);
    }

    [Fact]
    public async Task Consume_InvalidExtractionMarksNeedsReview()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient
        {
            Result = new ExtractAllResultDto
            {
                OverviewData = null,
                UserMonthlyTransactionsData = [],
                UserMonthlyIncomeExpenseTransactionsData = [],
                UserMonthlyCategoryExpenditureData = []
            }
        };

        var consumer = CreateConsumer(context, aiClient);

        await consumer.Consume(CreateConsumeContext(CreateMessage(upload)));

        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.NeedsReview);
        saved.ErrorMessage.Should().Contain("overviewData");
        context.ExtractedTransactions.Should().BeEmpty();
    }

    [Fact]
    public async Task Consume_AiExceptionMarksRetryingAndThrowsBeforeFinalAttempt()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient
        {
            Exception = new InvalidOperationException("AI unavailable")
        };

        var consumer = CreateConsumer(context, aiClient, retryAttempt: 1);

        var act = () => consumer.Consume(CreateConsumeContext(CreateMessage(upload)));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("AI unavailable");
        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.Retrying);
        saved.ErrorMessage.Should().Be("AI unavailable");
        saved.ProcessedAt.Should().BeNull();
        context.ExtractedTransactions.Should().BeEmpty();
    }

    [Fact]
    public async Task Consume_AiExceptionMarksFailedAndThrowsOnFinalAttempt()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient
        {
            Exception = new InvalidOperationException("AI unavailable")
        };

        var consumer = CreateConsumer(context, aiClient, retryAttempt: 3);

        var act = () => consumer.Consume(CreateConsumeContext(CreateMessage(upload)));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("AI unavailable");
        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.Failed);
        saved.ErrorMessage.Should().Be("AI unavailable");
        saved.ProcessedAt.Should().NotBeNull();
        context.ExtractedTransactions.Should().BeEmpty();
    }

    [Fact]
    public async Task Consume_IndexingExceptionMarksFailedAndThrowsOnFinalAttempt()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient { Result = CreateValidExtractionResult() };
        var indexer = new FakeTransactionSearchIndexer
        {
            Exception = new InvalidOperationException("Elasticsearch unavailable")
        };

        var consumer = CreateConsumer(
            context,
            aiClient,
            transactionSearchIndexer: indexer,
            retryAttempt: 3);

        var act = () => consumer.Consume(CreateConsumeContext(CreateMessage(upload)));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Elasticsearch unavailable");
        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.Failed);
        saved.ErrorMessage.Should().Be("Elasticsearch unavailable");
        saved.ProcessedAt.Should().NotBeNull();
        context.ExtractedTransactions.Should().ContainSingle(t => t.StatementUploadId == upload.Id);
    }

    [Fact]
    public async Task Consume_MetadataMismatchDoesNotProcess()
    {
        using var context = CreateContext();
        var upload = CreateUpload();
        context.StatementUploads.Add(upload);
        await context.SaveChangesAsync();
        var aiClient = new FakeAiClient { Result = CreateValidExtractionResult() };

        var consumer = CreateConsumer(context, aiClient);
        var message = new StatementUploaded(
            upload.Id,
            upload.UserId,
            upload.DashboardName,
            "different.pdf",
            upload.StoredFilePath,
            upload.UploadedAt);

        await consumer.Consume(CreateConsumeContext(message));

        var saved = await context.StatementUploads.SingleAsync(s => s.Id == upload.Id);
        saved.Status.Should().Be(StatementStatus.Queued);
        aiClient.Calls.Should().BeEmpty();
    }

    [Fact]
    public async Task Consume_MissingStatementDoesNotCreateRecord()
    {
        using var context = CreateContext();
        var aiClient = new FakeAiClient { Result = CreateValidExtractionResult() };
        var consumer = CreateConsumer(context, aiClient);
        var message = new StatementUploaded(
            Guid.NewGuid(),
            "user-1",
            "main",
            "statement.pdf",
            "/tmp/statement.pdf",
            DateTime.UtcNow);

        await consumer.Consume(CreateConsumeContext(message));

        context.StatementUploads.Should().BeEmpty();
        aiClient.Calls.Should().BeEmpty();
    }

    private static StatementUploaded CreateMessage(StatementUploadRecord upload)
    {
        return new StatementUploaded(
            upload.Id,
            upload.UserId,
            upload.DashboardName,
            upload.FileName,
            upload.StoredFilePath,
            upload.UploadedAt);
    }

    private static ConsumeContext<StatementUploaded> CreateConsumeContext(
        StatementUploaded message)
    {
        var consumeContext = new Mock<ConsumeContext<StatementUploaded>>();
        consumeContext.SetupGet(c => c.Message).Returns(message);
        consumeContext.SetupGet(c => c.CancellationToken).Returns(CancellationToken.None);
        return consumeContext.Object;
    }

    private static StatementUploadedConsumer CreateConsumer(
        StatementWorkerDbContext context,
        IAiStatementExtractionClient aiClient,
        IDashboardReadModelWriter? dashboardWriter = null,
        ITransactionSearchIndexer? transactionSearchIndexer = null,
        IDashboardCacheInvalidator? cacheInvalidator = null,
        int retryAttempt = 0)
    {
        return new StatementUploadedConsumer(
            context,
            aiClient,
            dashboardWriter ?? new FakeDashboardWriter(),
            transactionSearchIndexer ?? new FakeTransactionSearchIndexer(),
            cacheInvalidator ?? new FakeCacheInvalidator(),
            new FakeRetryStatus(retryAttempt),
            Mock.Of<ILogger<StatementUploadedConsumer>>());
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

    private static ExtractAllResultDto CreateValidExtractionResult()
    {
        return new ExtractAllResultDto
        {
            OverviewData =
            [
                new OverviewDataDto
                {
                    Month = "January 2026",
                    MoneyIn = 1000m,
                    MoneyOut = 100m,
                    StartingBalance = 500m
                }
            ],
            UserMonthlyTransactionsData =
            [
                new UserMonthlyTransactionsDataDto
                {
                    UserId = "user-1",
                    Month = "January 2026",
                    Transactions =
                    [
                        new DailyAmountDto { Day = "12", Amount = 25m }
                    ]
                }
            ],
            UserMonthlyIncomeExpenseTransactionsData =
            [
                new UserMonthlyIncomeExpenseDataDto
                {
                    UserId = "user-1",
                    Month = "January 2026",
                    StartingBalance = 500m,
                    Transactions =
                    [
                        new DailyIncomeExpenseDto
                        {
                            Day = "12",
                            Income = 0m,
                            Expense = 25m
                        }
                    ]
                }
            ],
            UserMonthlyCategoryExpenditureData =
            [
                new UserMonthlyCategoryExpenditureDataDto
                {
                    UserId = "user-1",
                    Month = "January 2026",
                    Category = "Other",
                    TotalSpend = 25m
                }
            ]
        };
    }

    private sealed class FakeAiClient : IAiStatementExtractionClient
    {
        public List<StatementUploadRecord> Calls { get; } = [];
        public ExtractAllResultDto? Result { get; set; }
        public Exception? Exception { get; set; }

        public Task<ExtractAllResultDto> ExtractAsync(
            StatementUploadRecord upload,
            CancellationToken ct = default)
        {
            Calls.Add(upload);

            if (Exception is not null)
            {
                throw Exception;
            }

            return Task.FromResult(Result!);
        }
    }

    private sealed class FakeDashboardWriter : IDashboardReadModelWriter
    {
        public List<(Guid UploadId, ExtractAllResultDto Result)> Upserts { get; } = [];

        public Task UpsertAsync(
            StatementUploadRecord upload,
            ExtractAllResultDto result,
            CancellationToken ct = default)
        {
            Upserts.Add((upload.Id, result));
            return Task.CompletedTask;
        }
    }

    private sealed class FakeCacheInvalidator : IDashboardCacheInvalidator
    {
        public List<string> UserIds { get; } = [];

        public Task InvalidateUserAsync(string userId, CancellationToken ct = default)
        {
            UserIds.Add(userId);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeTransactionSearchIndexer : ITransactionSearchIndexer
    {
        public List<IReadOnlyCollection<ExtractedTransactionRecord>> Indexed { get; } = [];
        public Exception? Exception { get; set; }

        public Task IndexAsync(
            IReadOnlyCollection<ExtractedTransactionRecord> transactions,
            CancellationToken ct = default)
        {
            if (Exception is not null)
            {
                throw Exception;
            }

            Indexed.Add(transactions);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeRetryStatus : IMessageRetryStatus
    {
        private readonly int _retryAttempt;

        public FakeRetryStatus(int retryAttempt)
        {
            _retryAttempt = retryAttempt;
        }

        public int GetRetryAttempt(ConsumeContext context)
        {
            return _retryAttempt;
        }
    }
}
