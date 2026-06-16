using BudgetlyAI.Contracts.Statements;

namespace BudgetlyAI.Services.Statements;

public interface IStatementEventPublisher
{
    Task PublishAsync(StatementUploaded message, CancellationToken ct = default);
}
