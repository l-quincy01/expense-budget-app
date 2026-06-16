using System.Globalization;
using StatementWorker.Data;
using StatementWorker.Extraction;

namespace StatementWorker.Processing;

public static class ExtractedTransactionMapper
{
    public static IReadOnlyList<ExtractedTransactionRecord> Map(
        StatementUploadRecord upload,
        ExtractAllResultDto result)
    {
        var records = new List<ExtractedTransactionRecord>();

        foreach (var monthBlock in result.UserMonthlyTransactionsData ?? [])
        {
            foreach (var transaction in monthBlock.Transactions ?? [])
            {
                records.Add(new ExtractedTransactionRecord
                {
                    Id = Guid.NewGuid(),
                    StatementUploadId = upload.Id,
                    UserId = upload.UserId,
                    DashboardName = upload.DashboardName,
                    Description = "Extracted statement transaction",
                    Amount = transaction.Amount,
                    Date = ParseDate(monthBlock.Month!, transaction.Day!, upload.UploadedAt)
                });
            }
        }

        return records;
    }

    private static DateTime ParseDate(string month, string day, DateTime uploadedAt)
    {
        if (!int.TryParse(day, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedDay))
        {
            throw new ExtractionValidationException($"Invalid transaction day '{day}'.");
        }

        if (parsedDay < 1 || parsedDay > 31)
        {
            throw new ExtractionValidationException($"Invalid transaction day '{day}'.");
        }

        var normalizedMonth = month.Trim();
        var formats = new[]
        {
            "MMMM yyyy",
            "MMM yyyy",
            "yyyy-MM",
            "MMMM",
            "MMM"
        };

        if (!DateTime.TryParseExact(
                normalizedMonth,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal,
                out var parsedMonth))
        {
            throw new ExtractionValidationException($"Invalid transaction month '{month}'.");
        }

        var year = parsedMonth.Year == 1 ? uploadedAt.Year : parsedMonth.Year;

        try
        {
            return new DateTime(year, parsedMonth.Month, parsedDay).Date;
        }
        catch (ArgumentOutOfRangeException)
        {
            throw new ExtractionValidationException(
                $"Invalid transaction date '{month} {day}'.");
        }
    }
}
