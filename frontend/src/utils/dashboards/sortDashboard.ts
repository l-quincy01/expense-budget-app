import { dashboard } from "@/types/types";

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function monthIdx(m?: string): number {
  const key = (m ?? "").trim().replace(/\./g, "").toLowerCase();
  return MONTH_INDEX[key] ?? Number.POSITIVE_INFINITY;
}

function sortByMonth<T extends { month: string }>(
  arr: T[] | undefined | null,
  order: "asc" | "desc" = "asc"
): T[] | undefined {
  if (!arr) return arr as undefined;
  const dir = order === "asc" ? 1 : -1;

  return [...arr]
    .map((item, i) => ({ item, i, m: monthIdx(item.month) }))
    .sort((a, b) => (a.m - b.m) * dir || a.i - b.i)
    .map((x) => x.item);
}

export function sortDashboardMonths(
  d: dashboard,
  opts?: {
    order?: "asc" | "desc";

    sortDaysWithinMonth?: boolean;
  }
): dashboard {
  const order = opts?.order ?? "asc";
  const sortDays = opts?.sortDaysWithinMonth ?? false;

  const userMonthlyTransactions = sortByMonth(d.userMonthlyTransactions, order);
  const userMonthlyIncomeExpenseTransactions = sortByMonth(
    d.userMonthlyIncomeExpenseTransactions,
    order
  );
  const userMonthlyCategoryExpenditure = sortByMonth(
    d.userMonthlyCategoryExpenditure,
    order
  );
  const overview = sortByMonth(
    d.overview as Array<{ month: string }>,
    order
  ) as typeof d.overview;

  if (sortDays) {
    userMonthlyTransactions?.forEach((m) =>
      m.transactions.sort((a, b) => Number(a.day) - Number(b.day))
    );
    userMonthlyIncomeExpenseTransactions?.forEach((m) =>
      m.transactions.sort((a, b) => Number(a.day) - Number(b.day))
    );
  }

  return {
    ...d,
    overview,
    userMonthlyTransactions,
    userMonthlyIncomeExpenseTransactions,
    userMonthlyCategoryExpenditure,
  };
}
