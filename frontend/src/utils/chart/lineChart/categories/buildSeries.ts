import { categories, userMonthlyCategoryExpenditure } from "@/types/types";

const MONTH_INDEX: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May2: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

MONTH_INDEX["May"] = 5;

const ABBR_TO_FULL: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

/* helper */
function normalizeMonth(m: string) {
  if (MONTH_INDEX[m] != null) return m;
  const abbr = (m || "").slice(0, 3);
  return ABBR_TO_FULL[abbr] ?? m;
}

/* main func */

export function buildSeries(
  data: userMonthlyCategoryExpenditure[],
  topCats: categories[]
) {
  const months = [
    ...new Set<string>(data.map((d) => normalizeMonth(d.month))),
  ].sort((a, b) => (MONTH_INDEX[a] ?? 99) - (MONTH_INDEX[b] ?? 99));

  const key = (m: string, c: categories) => `${m}__${c}`;
  const index = new Map<string, number>();

  for (const r of data) {
    const m = normalizeMonth(r.month);
    const c = r.category as categories;
    index.set(
      key(m, c),
      (index.get(key(m, c)) ?? 0) + Number(r.totalSpend ?? 0)
    );
  }

  return months.map((m) => {
    const row: Record<string, number | string> = { month: m };
    for (const c of topCats) {
      row[c] = Number(index.get(key(m, c)) ?? 0);
    }
    row.totalSpend = [...index.keys()]
      .filter((k) => k.startsWith(`${m}__`))
      .reduce((sum, k) => sum + (index.get(k) ?? 0), 0);
    return row;
  });
}
