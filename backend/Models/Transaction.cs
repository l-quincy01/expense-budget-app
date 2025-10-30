public class Transaction
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public int? BudgetId { get; set; }
    public Budget? Budget { get; set; }
    public string Title { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Category { get; set; } = default!;
    public string Type { get; set; } = "Expense";
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}