using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models.ReadModels.Dashboard;


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