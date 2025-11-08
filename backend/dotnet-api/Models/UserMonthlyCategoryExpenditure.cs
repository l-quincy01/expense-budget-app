using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models;

public class UserMonthlyCategoryExpenditure
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = null!;
    public string Month { get; set; } = null!;
    public string Category { get; set; } = null!;
    public double TotalSpend { get; set; }
    [BsonElement("DashboardName")]
    public string? DashboardName { get; set; }
}
