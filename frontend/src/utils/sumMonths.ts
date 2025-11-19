import { userMonthlyCategoryExpenditure } from "@/types/types";
import { prettyLabel } from "./labelPrettier";
export interface radarMonthsChartData {
  month: string;
  total: number;
}
export function sumMonthsForChart(
  data: userMonthlyCategoryExpenditure[]
): radarMonthsChartData[] {
  const totals = data.reduce((acc, row) => {
    const key = prettyLabel(row.month);
    acc[key] = (acc[key] ?? 0) + Number(row.totalSpend ?? 0);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([month, total]) => ({ month, total }));
}
