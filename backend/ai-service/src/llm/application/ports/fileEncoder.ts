import { PdfInput } from "#llm/domain/types";

export interface IFileEncoder {
  toDataUrl(file: PdfInput): string;
}
