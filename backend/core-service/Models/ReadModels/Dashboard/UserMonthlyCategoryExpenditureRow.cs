
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;

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