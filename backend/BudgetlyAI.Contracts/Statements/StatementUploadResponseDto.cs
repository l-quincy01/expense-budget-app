namespace BudgetlyAI.Contracts.Statements;

public sealed record StatementUploadResponseDto(
    IReadOnlyList<StatementUploadResultDto> Statements);
