using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;

[BsonIgnoreExtraElements]
public class DailyAmount
{
    [BsonElement("day")]
    public string Day { get; set; } = null!;

    [BsonElement("amount")]
    public double Amount { get; set; }
}