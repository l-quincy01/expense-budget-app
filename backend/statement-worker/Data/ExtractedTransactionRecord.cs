namespace StatementWorker.Data;

public sealed class ExtractedTransactionRecord
{
    public Guid Id { get; set; }
    public Guid StatementUploadId { get; set; }
    public string UserId { get; set; } = null!;
    public string DashboardName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Merchant { get; set; }
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? TransactionType { get; set; }
}
