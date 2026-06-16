namespace StatementWorker.Extraction;

public static class StatementExtractionValidator
{
    public static void Validate(ExtractAllResultDto result)
    {
        if (result.OverviewData is null)
        {
            throw new ExtractionValidationException("overviewData is required.");
        }

        if (result.UserMonthlyTransactionsData is null)
        {
            throw new ExtractionValidationException("userMonthlyTransactionsData is required.");
        }

        if (result.UserMonthlyIncomeExpenseTransactionsData is null)
        {
            throw new ExtractionValidationException("userMonthlyIncomeExpenseTransactionsData is required.");
        }

        if (result.UserMonthlyCategoryExpenditureData is null)
        {
            throw new ExtractionValidationException("userMonthlyCategoryExpenditureData is required.");
        }

        foreach (var overview in result.OverviewData)
        {
            if (string.IsNullOrWhiteSpace(overview.Month))
            {
                throw new ExtractionValidationException("overviewData entries require month.");
            }
        }

        foreach (var block in result.UserMonthlyTransactionsData)
        {
            if (string.IsNullOrWhiteSpace(block.Month))
            {
                throw new ExtractionValidationException("monthly transaction entries require month.");
            }

            if (block.Transactions is null)
            {
                throw new ExtractionValidationException("monthly transaction entries require transactions.");
            }

            foreach (var transaction in block.Transactions)
            {
                if (string.IsNullOrWhiteSpace(transaction.Day))
                {
                    throw new ExtractionValidationException("monthly transaction rows require day.");
                }
            }
        }

        foreach (var block in result.UserMonthlyIncomeExpenseTransactionsData)
        {
            if (string.IsNullOrWhiteSpace(block.Month) || block.Transactions is null)
            {
                throw new ExtractionValidationException("income/expense entries are malformed.");
            }
        }

        foreach (var row in result.UserMonthlyCategoryExpenditureData)
        {
            if (string.IsNullOrWhiteSpace(row.Month) || string.IsNullOrWhiteSpace(row.Category))
            {
                throw new ExtractionValidationException("category expenditure entries are malformed.");
            }
        }
    }
}
