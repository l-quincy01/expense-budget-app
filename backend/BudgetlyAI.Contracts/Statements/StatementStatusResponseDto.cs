namespace BudgetlyAI.Contracts.Statements;

public sealed record StatementStatusResponseDto(
    Guid Id,
    string DashboardName,
    string FileName,
    StatementStatus Status,
    string? ErrorMessage,
    DateTime UploadedAt,
    DateTime? ProcessedAt,
    int RetryCount);
