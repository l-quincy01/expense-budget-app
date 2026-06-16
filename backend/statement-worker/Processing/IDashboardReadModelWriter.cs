using StatementWorker.Data;
using StatementWorker.Extraction;

namespace StatementWorker.Processing;

public interface IDashboardReadModelWriter
{
    Task UpsertAsync(
        StatementUploadRecord upload,
        ExtractAllResultDto result,
        CancellationToken ct = default);
}
