namespace BudgetlyAI.Contracts.Statements;

public enum StatementStatus
{
    Uploaded,
    Queued,
    Processing,
    Completed,
    Failed,
    Retrying,
    NeedsReview
}
