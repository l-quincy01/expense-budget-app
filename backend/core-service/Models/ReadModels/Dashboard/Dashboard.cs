using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;


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



