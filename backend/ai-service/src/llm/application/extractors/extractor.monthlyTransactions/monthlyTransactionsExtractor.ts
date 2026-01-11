import { PdfInput, monthlyTransactions } from "#llm/domain/types";
import { validDay, normMonthName } from "#llm//domain/validators";
import { ILLMClient } from "#llm/application/ports/llmClient";
import { IFileEncoder } from "#llm/application/ports/fileEncoder";
import { JsonArrayParser } from "#llm/application/parsing/jsonArrayParser";
import { IPromptBuilder } from "#llm/application/prompts/promptBuilders";
import { IExtractor } from "#llm/application/extractors/extractors.interface/IExtractor";

export type MonthlyTransactionsOut = {
  userId: string;
  month: string;
  transactions: { day: string; amount: number }[];
}[];

export class MonthlyTransactionsExtractor
  implements IExtractor<MonthlyTransactionsOut>
{
  constructor(
    private readonly llm: ILLMClient,
    private readonly fileEncoder: IFileEncoder,
    private readonly parser: JsonArrayParser,
    private readonly prompt: IPromptBuilder
  ) {}

  async extract(
    pdfs: PdfInput[],
    userId: string
  ): Promise<MonthlyTransactionsOut> {
    const raw = await this.llm.completeText({
      temperature: 0,
      files: pdfs.map((f) => ({
        filename: f.filename,
        dataUrl: this.fileEncoder.toDataUrl(f),
      })),
      inputText: this.prompt.build(userId),
    });

    const blocks = this.parser.parseArray<monthlyTransactions>(
      raw,
      "Transactions"
    );

    return blocks.map((m) => ({
      userId,
      month: normMonthName(m.month),
      transactions: (m.transactions ?? [])
        .filter(
          (t) =>
            t &&
            typeof t.amount === "number" &&
            typeof t.day === "string" &&
            validDay(t.day)
        )
        .map((t) => ({ day: t.day, amount: t.amount })),
    }));
  }
}
