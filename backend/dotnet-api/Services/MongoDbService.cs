
using MongoDB.Driver;
using BudgetlyAI.Models;

namespace BudgetlyAI.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _db;

        public MongoDbService(IConfiguration config)
        {
            var connectionString = config["MongoDb:ConnectionString"];
            var databaseName = config["MongoDb:DatabaseName"];
            var client = new MongoClient(connectionString);
            _db = client.GetDatabase(databaseName);
        }


        public IMongoCollection<Budget> Budgets => _db.GetCollection<Budget>("budgets");
        public IMongoCollection<UserMonthlyTransaction> MonthlyTransactions => _db.GetCollection<UserMonthlyTransaction>("monthlyTransactions");
        public IMongoCollection<UserMonthlyIncomeExpense> MonthlyIncomeExpenses => _db.GetCollection<UserMonthlyIncomeExpense>("monthlyIncomeExpenses");
        public IMongoCollection<UserMonthlyCategoryExpenditure> MonthlyCategoryExpenditures => _db.GetCollection<UserMonthlyCategoryExpenditure>("monthlyCategoryExpenditures");

        public IMongoCollection<Dashboard> Dashboards => _db.GetCollection<Dashboard>("dashboards");
    }
}
