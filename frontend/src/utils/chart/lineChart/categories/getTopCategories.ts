import { Category, userMonthlyCategoryExpenditure } from "@/types/types";

export function getTopCategories(
  data: userMonthlyCategoryExpenditure[],
  topN = 4
): Category[] {
  const totals = new Map<Category, number>();
  for (const r of data) {
    if (r.category === "Other") continue;
    totals.set(
      r.category as Category,
      (totals.get(r.category as Category) ?? 0) + r.totalSpend
    );
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat]) => cat);
}
