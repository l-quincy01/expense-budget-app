import {
  userMonthlyCategoryExpenditure,
  categoryIcons,
  Category,
} from "@/types/types";
import { formatCategoryName, formatCurrency } from "@/lib/utils";
import { Utensils } from "lucide-react";

type SimpleTableManualProps = {
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export default function SimpleTableManual({
  monthlyCategoryExpenditure = [],
}: SimpleTableManualProps) {
  const totals = monthlyCategoryExpenditure.reduce((acc, row) => {
    const key = row.category as Category;
    acc[key] = (acc[key] ?? 0) + Number(row.totalSpend ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-2 pb-4">
      {sorted.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No category totals available yet.
        </div>
      ) : (
        sorted.map(([category, amount]) => {
          const IconComponent =
            categoryIcons[category as Category] ?? Utensils;
          const displayName = formatCategoryName(category).replaceAll(
            "And",
            "&"
          );
          return (
            <div
              key={category}
              className="grid grid-cols-[1fr_3fr_1fr] items-center border p-3 rounded-xl"
            >
              <div className="p-3 rounded-full bg-accent w-fit">
                <IconComponent size={20} />
              </div>
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-right font-semibold">
                {formatCurrency(amount)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
