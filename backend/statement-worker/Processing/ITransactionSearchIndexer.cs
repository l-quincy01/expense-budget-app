using StatementWorker.Data;

namespace StatementWorker.Processing;

public interface ITransactionSearchIndexer
{
    Task IndexAsync(
        IReadOnlyCollection<ExtractedTransactionRecord> transactions,
        CancellationToken ct = default);
}
