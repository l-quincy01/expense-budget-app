namespace StatementWorker.Extraction;

public sealed class ExtractionValidationException : Exception
{
    public ExtractionValidationException(string message) : base(message)
    {
    }
}
