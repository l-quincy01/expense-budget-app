using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;

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