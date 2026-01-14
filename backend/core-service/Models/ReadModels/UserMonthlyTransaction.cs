using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models;

public class DailyTransaction
{
    public string Day { get; set; } = null!;
    public double Amount { get; set; }
}

public class UserMonthlyTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = null!;
    public string Month { get; set; } = null!;
    public List<DailyTransaction> Transactions { get; set; } = new();
    [BsonElement("DashboardName")]
    public string? DashboardName { get; set; }
}
