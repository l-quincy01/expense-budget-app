import { PdfInput, categoryMonthlyTotal } from "#llm/domain/types";
import { normMonthName } from "#llm/domain/validators";
import { ILLMClient } from "#llm/application/ports/llmClient";
import { IFileEncoder } from "#llm/application/ports/fileEncoder";
import { JsonArrayParser } from "#llm/application/parsing/jsonArrayParser";
import { IPromptBuilder } from "#llm/application/prompts/promptBuilders";
import { IExtractor } from "#llm/application/extractors/extractors.interface/IExtractor";

export type CategoriesOut = {
  userId: string;
  month: string;
  category: categoryMonthlyTotal["category"];
  totalSpend: number;
}[];

export class CategoriesExtractor implements IExtractor<CategoriesOut> {
  constructor(
    private readonly llm: ILLMClient,
    private readonly fileEncoder: IFileEncoder,
    private readonly parser: JsonArrayParser,
    private readonly prompt: IPromptBuilder
  ) {}

  async extract(pdfs: PdfInput[], userId: string): Promise<CategoriesOut> {
    const raw = await this.llm.completeText({
      temperature: 0,
      files: pdfs.map((f) => ({
        filename: f.filename,
        dataUrl: this.fileEncoder.toDataUrl(f),
      })),
      inputText: this.prompt.build(userId),
    });

    const rows = this.parser.parseArray<categoryMonthlyTotal>(
      raw,
      "Categories"
    );

    return rows
      .filter(
        (r) =>
          r &&
          typeof r.month === "string" &&
          typeof r.category === "string" &&
          typeof r.totalSpend === "number"
      )
      .map((r) => ({
        userId,
        month: normMonthName(r.month),
        category: r.category as categoryMonthlyTotal["category"],
        totalSpend: r.totalSpend,
      }));
  }
}
