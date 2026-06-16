using BudgetlyAI.Contracts.Statements;
using Microsoft.AspNetCore.Http;

namespace BudgetlyAI.Services.Statements;

public interface IStatementService
{
    Task<StatementUploadResponseDto> UploadAsync(
        string userId,
        string dashboardName,
        IFormFile[] pdfs,
        CancellationToken ct = default);

    Task<IReadOnlyList<StatementStatusResponseDto>> ListAsync(
        string userId,
        CancellationToken ct = default);

    Task<StatementStatusResponseDto?> GetStatusAsync(
        string userId,
        Guid statementId,
        CancellationToken ct = default);
}
