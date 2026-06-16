using System.Text.Json.Serialization;

namespace StatementWorker.Extraction;

public sealed class ExtractAllResultDto
{
    [JsonPropertyName("userMonthlyTransactionsData")]
    public List<UserMonthlyTransactionsDataDto>? UserMonthlyTransactionsData { get; set; }

    [JsonPropertyName("userMonthlyIncomeExpenseTransactionsData")]
    public List<UserMonthlyIncomeExpenseDataDto>? UserMonthlyIncomeExpenseTransactionsData { get; set; }

    [JsonPropertyName("userMonthlyCategoryExpenditureData")]
    public List<UserMonthlyCategoryExpenditureDataDto>? UserMonthlyCategoryExpenditureData { get; set; }

    [JsonPropertyName("overviewData")]
    public List<OverviewDataDto>? OverviewData { get; set; }
}

public sealed class UserMonthlyTransactionsDataDto
{
    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    [JsonPropertyName("month")]
    public string? Month { get; set; }

    [JsonPropertyName("transactions")]
    public List<DailyAmountDto>? Transactions { get; set; }
}

public sealed class DailyAmountDto
{
    [JsonPropertyName("day")]
    public string? Day { get; set; }

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
}

public sealed class UserMonthlyIncomeExpenseDataDto
{
    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    [JsonPropertyName("month")]
    public string? Month { get; set; }

    [JsonPropertyName("startingBalance")]
    public decimal StartingBalance { get; set; }

    [JsonPropertyName("transactions")]
    public List<DailyIncomeExpenseDto>? Transactions { get; set; }
}

public sealed class DailyIncomeExpenseDto
{
    [JsonPropertyName("day")]
    public string? Day { get; set; }

    [JsonPropertyName("income")]
    public decimal Income { get; set; }

    [JsonPropertyName("expense")]
    public decimal Expense { get; set; }
}

public sealed class UserMonthlyCategoryExpenditureDataDto
{
    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    [JsonPropertyName("month")]
    public string? Month { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("totalSpend")]
    public decimal TotalSpend { get; set; }
}

public sealed class OverviewDataDto
{
    [JsonPropertyName("month")]
    public string? Month { get; set; }

    [JsonPropertyName("moneyIn")]
    public decimal MoneyIn { get; set; }

    [JsonPropertyName("moneyOut")]
    public decimal MoneyOut { get; set; }

    [JsonPropertyName("startingBalance")]
    public decimal StartingBalance { get; set; }
}
