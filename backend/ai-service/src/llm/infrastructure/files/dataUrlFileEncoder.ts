// src/infra/files/DataUrlFileEncoder.ts

import { IFileEncoder } from "#llm/application/ports/fileEncoder";
import { PdfInput } from "#llm/domain/types";
import { lookup as mimeLookup } from "mime-types";

export class DataUrlFileEncoder implements IFileEncoder {
  toDataUrl(file: PdfInput): string {
    const mime = mimeLookup(file.filename) || "application/pdf";
    return `data:${mime};base64,${file.buffer.toString("base64")}`;
  }
}
