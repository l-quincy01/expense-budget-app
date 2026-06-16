using Microsoft.AspNetCore.Http;

namespace BudgetlyAI.Services.Statements;

public interface IStatementFileStorage
{
    Task<string> SaveAsync(
        string userId,
        Guid statementId,
        IFormFile file,
        CancellationToken ct = default);

    Task DeleteIfExistsAsync(string storedFilePath, CancellationToken ct = default);
}
