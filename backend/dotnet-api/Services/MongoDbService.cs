
using MongoDB.Driver;
using BudgetlyAI.Models;
using Serilog;

namespace BudgetlyAI.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _db;
        private readonly ILogger<MongoDbService> _logger;

        public MongoDbService(IConfiguration config, ILogger<MongoDbService> logger)
        {
            _logger = logger;

            _logger.LogInformation("[MongoDbService] Initializing MongoDB connection");

            var connectionString = config["MongoDb:ConnectionString"];
            var databaseName = config["MongoDb:DatabaseName"];

            _logger.LogInformation("[MongoDbService] ConnectionString found={HasConnectionString}", !string.IsNullOrWhiteSpace(connectionString));
            _logger.LogInformation("[MongoDbService] DatabaseName={DatabaseName}", databaseName);

            try
            {
                var client = new MongoClient(connectionString);
                _db = client.GetDatabase(databaseName);

                _logger.LogInformation("[MongoDbService] MongoDB database connection established successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MongoDbService] Failed to initialize MongoDB connection");
                throw;
            }
        }

        public IMongoCollection<Budget> Budgets =>
            _db.GetCollection<Budget>("budgets");

        public IMongoCollection<UserMonthlyTransaction> MonthlyTransactions =>
            _db.GetCollection<UserMonthlyTransaction>("monthlyTransactions");

        public IMongoCollection<UserMonthlyIncomeExpense> MonthlyIncomeExpenses =>
            _db.GetCollection<UserMonthlyIncomeExpense>("monthlyIncomeExpenses");

        public IMongoCollection<UserMonthlyCategoryExpenditure> MonthlyCategoryExpenditures =>
            _db.GetCollection<UserMonthlyCategoryExpenditure>("monthlyCategoryExpenditures");

        public IMongoCollection<Dashboard> Dashboards =>
            _db.GetCollection<Dashboard>("dashboards");
    }
}
