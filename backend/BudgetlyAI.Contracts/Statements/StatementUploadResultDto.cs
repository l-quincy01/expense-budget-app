namespace BudgetlyAI.Contracts.Statements;

public sealed record StatementUploadResultDto(
    Guid Id,
    string FileName,
    StatementStatus Status,
    DateTime UploadedAt);
