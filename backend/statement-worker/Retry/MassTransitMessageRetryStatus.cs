using MassTransit;

namespace StatementWorker.Retry;

public sealed class MassTransitMessageRetryStatus : IMessageRetryStatus
{
    public int GetRetryAttempt(ConsumeContext context)
    {
        return context.GetRetryAttempt();
    }
}
