using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models;

public class Budget
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = null!;
    public string Category { get; set; } = null!;
    public double BudgetAmount { get; set; }
    public double SpentAmount { get; set; }
}
