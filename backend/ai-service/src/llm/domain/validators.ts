export function validDay(d: string): boolean {
  return /^(0[1-9]|[12][0-9]|3[01])$/.test(d);
}

export function normMonthName(s: unknown): string {
  return String(s ?? "").trim();
}

export function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
