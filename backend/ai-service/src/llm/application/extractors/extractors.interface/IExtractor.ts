import { PdfInput } from "#llm/domain/types";

export interface IExtractor<TOut> {
  extract(pdfs: PdfInput[], userId: string): Promise<TOut>;
}
