import { categories, userMonthlyCategoryExpenditure } from "@/types/types";
import { prettyLabel } from "./labelPrettier";
export interface radarCategoriesChartData {
  category: string;
  total: number;
}
export interface CategoryTotalsByMonth {
  month: string;
  category: categories;
  totalSpend: number;
}

export interface MonthlyCategoryTotals {
  month: string;
  category: categories;
  totalSpend: number;
  fill: string;
}

export function sumCategoriesForChart(
  data: userMonthlyCategoryExpenditure[]
): radarCategoriesChartData[] {
  const totals = data.reduce((acc, row) => {
    const key = prettyLabel(row.category);
    acc[key] = (acc[key] ?? 0) + Number(row.totalSpend ?? 0);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, total]) => ({ category, total }));
}

export function sumCategoryTotalsByMonth(
  data: userMonthlyCategoryExpenditure[],
  categoryName: categories
): CategoryTotalsByMonth[] {
  const map = new Map<string, number>();

  for (const item of data) {
    if (item.category !== categoryName) continue;

    const current = map.get(item.month) ?? 0;
    const add = Number(item.totalSpend ?? 0);
    map.set(item.month, Number((current + add).toFixed(2)));
  }

  return Array.from(map.entries()).map(([month, totalSpend]) => ({
    month,
    category: categoryName,
    totalSpend,
  }));
}
export function sumMonthAllCategoryTotals(
  data: userMonthlyCategoryExpenditure[],
  monthName: string
): MonthlyCategoryTotals[] {
  const map = new Map<categories, number>();

  for (const item of data) {
    if (item.month !== monthName) continue;

    const current = map.get(item.category) ?? 0;
    map.set(item.category, current + item.totalSpend);
  }

  let results = Array.from(map.entries()).map(([category, totalSpend]) => ({
    month: monthName,
    category,
    totalSpend,
    fill: "",
  }));

  results.sort((a, b) => b.totalSpend - a.totalSpend);

  let colorIndex = 1;
  const maxColors = 15;

  results = results.map((item) => {
    const fill = `var(--chart-${colorIndex})`;
    colorIndex = colorIndex === maxColors ? 1 : colorIndex + 1;

    return { ...item, fill };
  });

  return results.slice(0, 5);
}
