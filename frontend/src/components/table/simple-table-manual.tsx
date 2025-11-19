import {
  userMonthlyCategoryExpenditure,
  categoryIcons,
  categories,
} from "@/types/types";
import { Utensils } from "lucide-react";

type SimpleTableManualProps = {
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export default function SimpleTableManual({
  monthlyCategoryExpenditure = [],
}: SimpleTableManualProps) {
  const totals = monthlyCategoryExpenditure.reduce((acc, row) => {
    const key = row.category as categories;
    acc[key] = (acc[key] ?? 0) + Number(row.totalSpend ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const formatRand = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value);

  return (
    <div className="flex flex-col gap-2 pb-4">
      {sorted.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No category totals available yet.
        </div>
      ) : (
        sorted.map(([category, amount]) => {
          const IconComponent =
            categoryIcons[category as categories] ?? Utensils;
          const displayName = category
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replaceAll("And", "&");
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
                {formatRand(amount)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
