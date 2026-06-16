using BudgetlyAI.Contracts.Statements;
using MassTransit;

namespace BudgetlyAI.Services.Statements;

public sealed class MassTransitStatementEventPublisher : IStatementEventPublisher
{
    private readonly IPublishEndpoint _publishEndpoint;

    public MassTransitStatementEventPublisher(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task PublishAsync(StatementUploaded message, CancellationToken ct = default)
    {
        return _publishEndpoint.Publish(message, ct);
    }
}
