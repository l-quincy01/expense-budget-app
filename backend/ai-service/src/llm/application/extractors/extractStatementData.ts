import { CategoriesOut } from "#llm/application/extractors/extractor.categories/categoriesExtractor";
import { IncomeExpenseOut } from "#llm/application/extractors/extractor.incomeExpense/incomeExpenseExtractor";
import { IExtractor } from "#llm/application/extractors/extractors.interface/IExtractor";
import { MonthlyTransactionsOut } from "#llm/application/extractors/extractor.monthlyTransactions/monthlyTransactionsExtractor";
import { ExtractAllResult, accountOverview, PdfInput } from "#llm/domain/types";

export class ExtractStatementData {
  constructor(
    private readonly txExtractor: IExtractor<MonthlyTransactionsOut>,
    private readonly ieExtractor: IExtractor<IncomeExpenseOut>,
    private readonly catExtractor: IExtractor<CategoriesOut>,
    private readonly overviewExtractor: IExtractor<accountOverview[]>
  ) {}

  async execute(pdfs: PdfInput[], userId: string): Promise<ExtractAllResult> {
    const userMonthlyTransactionsData = await this.txExtractor.extract(
      pdfs,
      userId
    );
    const userMonthlyIncomeExpenseTransactionsData =
      await this.ieExtractor.extract(pdfs, userId);
    const userMonthlyCategoryExpenditureData = await this.catExtractor.extract(
      pdfs,
      userId
    );
    const overviewData = await this.overviewExtractor.extract(pdfs, userId);

    return {
      userMonthlyTransactionsData,
      userMonthlyIncomeExpenseTransactionsData,
      userMonthlyCategoryExpenditureData,
      overviewData,
    };
  }
}
