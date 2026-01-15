import { categories, userMonthlyCategoryExpenditure } from "@/types/types";

export function getTopCategories(
  data: userMonthlyCategoryExpenditure[],
  topN = 4
): categories[] {
  const totals = new Map<categories, number>();
  for (const r of data) {
    if (r.category === "Other") continue;
    totals.set(
      r.category as categories,
      (totals.get(r.category as categories) ?? 0) + r.totalSpend
    );
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat]) => cat);
}
