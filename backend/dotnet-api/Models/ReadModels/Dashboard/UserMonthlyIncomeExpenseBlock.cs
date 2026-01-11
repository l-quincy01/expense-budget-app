using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;


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