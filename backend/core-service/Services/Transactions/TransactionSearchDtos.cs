namespace BudgetlyAI.Services.Transactions;

public sealed record TransactionSearchRequest(
    string? Query,
    string? Category,
    DateOnly? From,
    DateOnly? To,
    decimal? MinAmount,
    decimal? MaxAmount,
    string? TransactionType,
    Guid? StatementId,
    string? DashboardName);

public sealed record TransactionSearchResultDto(
    Guid Id,
    Guid StatementId,
    string DashboardName,
    DateOnly Date,
    string Description,
    string? Merchant,
    string? Category,
    decimal Amount,
    string? TransactionType);

public sealed record TransactionSearchResponseDto(
    IReadOnlyList<TransactionSearchResultDto> Results,
    int Total);
