import { PdfInput, incomeExpense } from "#llm/domain/types";
import { validDay, normMonthName, coerceNumber } from "#llm/domain/validators";
import { ILLMClient } from "#llm/application/ports/llmClient";
import { IFileEncoder } from "#llm/application/ports/fileEncoder";
import { JsonArrayParser } from "#llm/application/parsing/jsonArrayParser";
import { IPromptBuilder } from "#llm/application/prompts/promptBuilders";
import { IExtractor } from "#llm/application/extractors/extractors.interface/IExtractor";

export type IncomeExpenseOut = {
  userId: string;
  month: string;
  startingBalance: number;
  transactions: { day: string; income: number; expense: number }[];
}[];

export class IncomeExpenseExtractor implements IExtractor<IncomeExpenseOut> {
  constructor(
    private readonly llm: ILLMClient,
    private readonly fileEncoder: IFileEncoder,
    private readonly parser: JsonArrayParser,
    private readonly prompt: IPromptBuilder
  ) {}

  async extract(pdfs: PdfInput[], userId: string): Promise<IncomeExpenseOut> {
    const raw = await this.llm.completeText({
      temperature: 0,
      files: pdfs.map((f) => ({
        filename: f.filename,
        dataUrl: this.fileEncoder.toDataUrl(f),
      })),
      inputText: this.prompt.build(userId),
    });

    const blocks = this.parser.parseArray<incomeExpense>(raw, "Income/Expense");

    return blocks.map((m) => {
      const startingBalance = coerceNumber(m.startingBalance) ?? 0;

      return {
        userId,
        month: normMonthName(m.month),
        startingBalance,
        transactions: (m.transactions ?? [])
          .filter(
            (t) =>
              t &&
              typeof t.income === "number" &&
              typeof t.expense === "number" &&
              typeof t.day === "string" &&
              validDay(t.day)
          )
          .map((t) => ({ day: t.day, income: t.income, expense: t.expense })),
      };
    });
  }
}
