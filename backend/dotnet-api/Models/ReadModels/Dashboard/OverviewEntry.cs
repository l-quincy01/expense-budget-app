using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

[BsonIgnoreExtraElements]
public class OverviewEntry
{
    [BsonElement("moneyIn")]
    public double MoneyIn { get; set; }

    [BsonElement("moneyOut")]
    public double MoneyOut { get; set; }


    [BsonElement("month")]
    public string Month { get; set; } = null!;

    [BsonElement("startingBalance")]
    public double StartingBalance { get; set; }

    [BsonElement("totalBudget")]
    public double? TotalBudget { get; set; }
}