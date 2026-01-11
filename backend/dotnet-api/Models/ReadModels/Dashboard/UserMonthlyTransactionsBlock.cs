using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;


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