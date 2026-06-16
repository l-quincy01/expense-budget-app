namespace BudgetlyAI.Contracts.Statements;

public sealed record StatementUploaded(
    Guid StatementId,
    string UserId,
    string DashboardName,
    string FileName,
    string StoredFilePath,
    DateTime UploadedAt);
