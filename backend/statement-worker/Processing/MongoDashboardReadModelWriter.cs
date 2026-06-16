using MongoDB.Bson;
using MongoDB.Driver;
using StatementWorker.Data;
using StatementWorker.Extraction;

namespace StatementWorker.Processing;

public sealed class MongoDashboardReadModelWriter : IDashboardReadModelWriter
{
    private readonly IMongoCollection<BsonDocument> _dashboards;

    public MongoDashboardReadModelWriter(IConfiguration configuration)
    {
        var connectionString = configuration["MongoDb:ConnectionString"];
        var databaseName = configuration["MongoDb:DatabaseName"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("MongoDb:ConnectionString is required.");
        }

        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new InvalidOperationException("MongoDb:DatabaseName is required.");
        }

        var client = new MongoClient(connectionString);
        _dashboards = client
            .GetDatabase(databaseName)
            .GetCollection<BsonDocument>("dashboards");
    }

    public async Task UpsertAsync(
        StatementUploadRecord upload,
        ExtractAllResultDto result,
        CancellationToken ct = default)
    {
        var filter = Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("userId", upload.UserId),
            Builders<BsonDocument>.Filter.Eq("name", upload.DashboardName));

        var existing = await _dashboards.Find(filter).FirstOrDefaultAsync(ct);
        if (existing is null)
        {
            await _dashboards.InsertOneAsync(
                BuildDashboardDocument(upload, result),
                cancellationToken: ct);
            return;
        }

        var push = new BsonDocument();
        AddEach(push, "overview", BuildOverview(result));
        AddEach(push, "userMonthlyTransactions", BuildMonthlyTransactions(upload, result));
        AddEach(push, "userMonthlyIncomeExpenseTransactions", BuildIncomeExpense(upload, result));
        AddEach(push, "userMonthlyCategoryExpenditure", BuildCategories(upload, result));

        var update = Builders<BsonDocument>.Update.Set("updatedAt", DateTime.UtcNow);
        if (push.ElementCount > 0)
        {
            update = update.PushEach("overview", BuildOverview(result))
                .PushEach("userMonthlyTransactions", BuildMonthlyTransactions(upload, result))
                .PushEach("userMonthlyIncomeExpenseTransactions", BuildIncomeExpense(upload, result))
                .PushEach("userMonthlyCategoryExpenditure", BuildCategories(upload, result))
                .Set("updatedAt", DateTime.UtcNow);
        }

        await _dashboards.UpdateOneAsync(filter, update, cancellationToken: ct);
    }

    private static BsonDocument BuildDashboardDocument(
        StatementUploadRecord upload,
        ExtractAllResultDto result)
    {
        return new BsonDocument
        {
            ["userId"] = upload.UserId,
            ["name"] = upload.DashboardName,
            ["overview"] = new BsonArray(BuildOverview(result)),
            ["userMonthlyTransactions"] = new BsonArray(BuildMonthlyTransactions(upload, result)),
            ["userMonthlyIncomeExpenseTransactions"] = new BsonArray(BuildIncomeExpense(upload, result)),
            ["userMonthlyCategoryExpenditure"] = new BsonArray(BuildCategories(upload, result)),
            ["createdAt"] = DateTime.UtcNow,
            ["updatedAt"] = DateTime.UtcNow
        };
    }

    private static IEnumerable<BsonDocument> BuildOverview(ExtractAllResultDto result)
    {
        return (result.OverviewData ?? []).Select(o => new BsonDocument
        {
            ["month"] = o.Month,
            ["moneyIn"] = ToDouble(o.MoneyIn),
            ["moneyOut"] = ToDouble(o.MoneyOut),
            ["startingBalance"] = ToDouble(o.StartingBalance)
        });
    }

    private static IEnumerable<BsonDocument> BuildMonthlyTransactions(
        StatementUploadRecord upload,
        ExtractAllResultDto result)
    {
        return (result.UserMonthlyTransactionsData ?? []).Select(m => new BsonDocument
        {
            ["userId"] = upload.UserId,
            ["dashboardName"] = upload.DashboardName,
            ["month"] = m.Month,
            ["transactions"] = new BsonArray((m.Transactions ?? []).Select(t => new BsonDocument
            {
                ["day"] = t.Day,
                ["amount"] = ToDouble(t.Amount)
            }))
        });
    }

    private static IEnumerable<BsonDocument> BuildIncomeExpense(
        StatementUploadRecord upload,
        ExtractAllResultDto result)
    {
        return (result.UserMonthlyIncomeExpenseTransactionsData ?? []).Select(m => new BsonDocument
        {
            ["userId"] = upload.UserId,
            ["dashboardName"] = upload.DashboardName,
            ["month"] = m.Month,
            ["startingBalance"] = ToDouble(m.StartingBalance),
            ["transactions"] = new BsonArray((m.Transactions ?? []).Select(t => new BsonDocument
            {
                ["day"] = t.Day,
                ["income"] = ToDouble(t.Income),
                ["expense"] = ToDouble(t.Expense)
            }))
        });
    }

    private static IEnumerable<BsonDocument> BuildCategories(
        StatementUploadRecord upload,
        ExtractAllResultDto result)
    {
        return (result.UserMonthlyCategoryExpenditureData ?? []).Select(c => new BsonDocument
        {
            ["userId"] = upload.UserId,
            ["dashboardName"] = upload.DashboardName,
            ["month"] = c.Month,
            ["category"] = c.Category,
            ["totalSpend"] = ToDouble(c.TotalSpend)
        });
    }

    private static double ToDouble(decimal value)
    {
        return decimal.ToDouble(value);
    }

    private static void AddEach(
        BsonDocument push,
        string field,
        IEnumerable<BsonDocument> values)
    {
        var array = new BsonArray(values);
        if (array.Count > 0)
        {
            push[field] = new BsonDocument("$each", array);
        }
    }
}
