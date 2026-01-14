using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BudgetlyAI.Models;

public class IncomeExpense
{
    public string Day { get; set; } = null!;
    public double Income { get; set; }
    public double Expense { get; set; }
}

public class UserMonthlyIncomeExpense
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = null!;
    public string Month { get; set; } = null!;
    [BsonElement("startingBalance")]
    public double StartingBalance { get; set; }
    public List<IncomeExpense> Transactions { get; set; } = new();
    [BsonElement("DashboardName")]
    public string? DashboardName { get; set; }
}
