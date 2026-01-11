export interface ITextSanitizer {
  sanitize(raw: string): string;
}

export class JsonSanitizer implements ITextSanitizer {
  sanitize(raw: string): string {
    let txt = raw.trim();
    txt = stripCodeFences(txt);
    txt = normalizeQuotes(txt);
    txt = extractTopLevelJSONArray(txt) ?? txt;
    txt = removeNumberCommas(txt);
    txt = removeTrailingCommas(txt);
    return txt.trim();
  }
}

function stripCodeFences(s: string): string {
  const t = s.trim();
  if (!t.startsWith("```")) return t;

  return t
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

function normalizeQuotes(s: string): string {
  return s
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2018\u2019\u2032]/g, "'");
}

function removeNumberCommas(s: string): string {
  return s.replace(/(\d),(\d)/g, "$1$2");
}

function removeTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1");
}

function extractTopLevelJSONArray(s: string): string | null {
  const first = s.indexOf("[");
  const last = s.lastIndexOf("]");
  if (first === -1 || last === -1 || last <= first) return null;
  return s.substring(first, last + 1);
}
