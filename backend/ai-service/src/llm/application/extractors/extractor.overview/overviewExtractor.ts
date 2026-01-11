import { accountOverview, PdfInput } from "#llm/domain/types";
import { normMonthName } from "#llm/domain/validators";
import { JsonArrayParser } from "#llm/application/parsing/jsonArrayParser";
import { IFileEncoder } from "#llm/application/ports/fileEncoder";
import { ILLMClient } from "#llm/application/ports/llmClient";
import { IPromptBuilder } from "#llm/application/prompts/promptBuilders";
import { IExtractor } from "#llm/application/extractors/extractors.interface/IExtractor";

export class OverviewExtractor implements IExtractor<accountOverview[]> {
  constructor(
    private readonly llm: ILLMClient,
    private readonly fileEncoder: IFileEncoder,
    private readonly parser: JsonArrayParser,
    private readonly prompt: IPromptBuilder
  ) {}

  async extract(pdfs: PdfInput[], userId: string): Promise<accountOverview[]> {
    const raw = await this.llm.completeText({
      temperature: 0,
      files: pdfs.map((f) => ({
        filename: f.filename,
        dataUrl: this.fileEncoder.toDataUrl(f),
      })),
      inputText: this.prompt.build(userId),
    });

    const rows = this.parser.parseArray<accountOverview>(raw, "Overview");

    return rows
      .filter(
        (r) =>
          r &&
          typeof r.month === "string" &&
          typeof r.moneyIn === "number" &&
          typeof r.moneyOut === "number" &&
          typeof r.startingBalance === "number"
      )
      .map((r) => ({
        month: normMonthName(r.month),
        moneyIn: r.moneyIn,
        moneyOut: r.moneyOut,
        startingBalance: r.startingBalance,
      }));
  }
}
