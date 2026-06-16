using MassTransit;

namespace StatementWorker.Retry;

public interface IMessageRetryStatus
{
    int GetRetryAttempt(ConsumeContext context);
}
