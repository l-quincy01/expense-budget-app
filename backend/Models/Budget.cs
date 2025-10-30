public class Budget
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string Category { get; set; } = default!;
    public decimal BudgetAmount { get; set; }
    public DateTime Month { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Transaction> Transactions { get; set; } = new();
}
