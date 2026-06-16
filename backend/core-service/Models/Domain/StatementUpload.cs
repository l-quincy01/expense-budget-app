using BudgetlyAI.Contracts.Statements;

namespace BudgetlyAI.Models;

public class StatementUpload
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public string DashboardName { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string StoredFilePath { get; set; } = null!;
    public StatementStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int RetryCount { get; set; }

    public ICollection<ExtractedTransaction> ExtractedTransactions { get; set; } =
        new List<ExtractedTransaction>();
}
