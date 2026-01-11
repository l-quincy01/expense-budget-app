import { ITextSanitizer } from "#llm/application/parsing/jsonSanitizer";

export class JsonArrayParser {
  constructor(private readonly sanitizer: ITextSanitizer) {}

  parseArray<T = unknown>(raw: string, label: string): T[] {
    const preview = (txt: string) =>
      txt.length > 500 ? `${txt.slice(0, 500)}…` : txt;

    const sanitized = this.sanitizer.sanitize(raw);

    try {
      const parsed = JSON.parse(sanitized);
      if (!Array.isArray(parsed)) {
        throw new Error(`${label}: parsed JSON is not an array`);
      }
      return parsed as T[];
    } catch {
      throw new Error(
        `${label} JSON parse error. Raw preview:\n${preview(sanitized)}`
      );
    }
  }
}
