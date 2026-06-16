using StatementWorker.Data;

namespace StatementWorker.Extraction;

public interface IAiStatementExtractionClient
{
    Task<ExtractAllResultDto> ExtractAsync(
        StatementUploadRecord upload,
        CancellationToken ct = default);
}
