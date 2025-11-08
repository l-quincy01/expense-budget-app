using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models
{

    [BsonIgnoreExtraElements]
    public class Dashboard
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("overview")]
        public List<OverviewEntry> Overview { get; set; } = new();


        [BsonElement("budgets")]
        public BudgetEntry? Budgets { get; set; }

        [BsonElement("userMonthlyTransactions")]
        public List<UserMonthlyTransactionsBlock> UserMonthlyTransactions { get; set; } = new();

        [BsonElement("userMonthlyIncomeExpenseTransactions")]
        public List<UserMonthlyIncomeExpenseBlock> UserMonthlyIncomeExpenseTransactions { get; set; } = new();

        [BsonElement("userMonthlyCategoryExpenditure")]
        public List<UserMonthlyCategoryExpenditureRow> UserMonthlyCategoryExpenditure { get; set; } = new();

        [BsonElement("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }


    [BsonIgnoreExtraElements]
    public class OverviewEntry
    {
        [BsonElement("moneyIn")]
        public double MoneyIn { get; set; }

        [BsonElement("moneyOut")]
        public double MoneyOut { get; set; }


        [BsonElement("month")]
        public string Moonth { get; set; } = null!;

        [BsonElement("startingBalance")]
        public double StartingBalance { get; set; }

        [BsonElement("totalBudget")]
        public double? TotalBudget { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class BudgetEntry
    {
        [BsonElement("category")]
        public string Category { get; set; } = null!;

        [BsonElement("budgetAmount")]
        public double BudgetAmount { get; set; }

        [BsonElement("spentAmount")]
        public double SpentAmount { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class UserMonthlyTransactionsBlock
    {
        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("dashboardName")]
        public string DashboardName { get; set; } = null!;

        [BsonElement("month")]
        public string Month { get; set; } = null!;

        [BsonElement("transactions")]
        public List<DailyAmount> Transactions { get; set; } = new();
    }

    [BsonIgnoreExtraElements]
    public class DailyAmount
    {
        [BsonElement("day")]
        public string Day { get; set; } = null!;

        [BsonElement("amount")]
        public double Amount { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class UserMonthlyIncomeExpenseBlock
    {
        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("dashboardName")]
        public string DashboardName { get; set; } = null!;

        [BsonElement("month")]
        public string Month { get; set; } = null!;

        [BsonElement("startingBalance")]
        public double StartingBalance { get; set; }

        [BsonElement("transactions")]
        public List<DailyIncomeExpense> Transactions { get; set; } = new();
    }

    [BsonIgnoreExtraElements]
    public class DailyIncomeExpense
    {
        [BsonElement("day")]
        public string Day { get; set; } = null!;

        [BsonElement("income")]
        public double Income { get; set; }

        [BsonElement("expense")]
        public double Expense { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class UserMonthlyCategoryExpenditureRow
    {
        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("dashboardName")]
        public string DashboardName { get; set; } = null!;

        [BsonElement("month")]
        public string Month { get; set; } = null!;

        [BsonElement("category")]
        public string Category { get; set; } = null!;

        [BsonElement("totalSpend")]
        public double TotalSpend { get; set; }
    }
}
