"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category =
  | "GeneralRetail"
  | "Transport"
  | "EatingOutAndTreats"
  | "Fuel"
  | "Groceries"
  | "ProfessionalServices"
  | "CarUseAndServices"
  | "DonationsAndGiving"
  | "GiftsAndFlowers"
  | "Hobbies"
  | "HomewareAndAppliances"
  | "MusicGamingApps"
  | "OutdoorAndAdventure"
  | "PharmaciesAndWellbeing"
  | "TravelAndHolidays"
  | "Other";

type MonthName =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

type RawMonthly = {
  month: MonthName;
  category: Category;

  totalSpend: number;
};

const rawMonthly: RawMonthly[] = [
  { month: "January", category: "Groceries", totalSpend: 520.35 },
  { month: "January", category: "Transport", totalSpend: 240.5 },
  { month: "January", category: "EatingOutAndTreats", totalSpend: 310.2 },
  { month: "January", category: "GeneralRetail", totalSpend: 180.0 },
  { month: "January", category: "Fuel", totalSpend: 350.75 },
  { month: "January", category: "ProfessionalServices", totalSpend: 120.0 },
  { month: "January", category: "PharmaciesAndWellbeing", totalSpend: 95.6 },
  { month: "January", category: "MusicGamingApps", totalSpend: 29.99 },

  { month: "February", category: "Groceries", totalSpend: 480.1 },
  { month: "February", category: "Transport", totalSpend: 262.9 },
  { month: "February", category: "EatingOutAndTreats", totalSpend: 282.0 },
  { month: "February", category: "GeneralRetail", totalSpend: 210.0 },
  { month: "February", category: "Fuel", totalSpend: 330.4 },
  { month: "February", category: "ProfessionalServices", totalSpend: 90.0 },
  { month: "February", category: "HomewareAndAppliances", totalSpend: 150.0 },
  { month: "February", category: "DonationsAndGiving", totalSpend: 50.0 },

  { month: "March", category: "Groceries", totalSpend: 560.0 },
  { month: "March", category: "Transport", totalSpend: 275.0 },
  { month: "March", category: "EatingOutAndTreats", totalSpend: 340.0 },
  { month: "March", category: "GeneralRetail", totalSpend: 220.0 },
  { month: "March", category: "Fuel", totalSpend: 372.5 },
  { month: "March", category: "TravelAndHolidays", totalSpend: 820.0 },
  { month: "March", category: "PharmaciesAndWellbeing", totalSpend: 60.0 },
  { month: "March", category: "CarUseAndServices", totalSpend: 200.0 },

  { month: "April", category: "Groceries", totalSpend: 510.0 },
  { month: "April", category: "Transport", totalSpend: 232.0 },
  { month: "April", category: "EatingOutAndTreats", totalSpend: 295.0 },
  { month: "April", category: "GeneralRetail", totalSpend: 170.0 },
  { month: "April", category: "Fuel", totalSpend: 360.0 },
  { month: "April", category: "ProfessionalServices", totalSpend: 405.0 },
  { month: "April", category: "HomewareAndAppliances", totalSpend: 210.0 },
  { month: "April", category: "OutdoorAndAdventure", totalSpend: 180.0 },

  { month: "May", category: "Groceries", totalSpend: 542.0 },
  { month: "May", category: "Transport", totalSpend: 258.0 },
  { month: "May", category: "EatingOutAndTreats", totalSpend: 318.0 },
  { month: "May", category: "GeneralRetail", totalSpend: 212.0 },
  { month: "May", category: "Fuel", totalSpend: 381.0 },
  { month: "May", category: "TravelAndHolidays", totalSpend: 1205.0 },
  { month: "May", category: "Hobbies", totalSpend: 140.0 },
  { month: "May", category: "GiftsAndFlowers", totalSpend: 92.0 },

  { month: "June", category: "Groceries", totalSpend: 505.0 },
  { month: "June", category: "Transport", totalSpend: 246.0 },
  { month: "June", category: "EatingOutAndTreats", totalSpend: 312.0 },
  { month: "June", category: "GeneralRetail", totalSpend: 195.0 },
  { month: "June", category: "Fuel", totalSpend: 356.0 },
  { month: "June", category: "ProfessionalServices", totalSpend: 300.0 },
  { month: "June", category: "MusicGamingApps", totalSpend: 49.99 },
  { month: "June", category: "PharmaciesAndWellbeing", totalSpend: 80.0 },

  { month: "July", category: "Groceries", totalSpend: 592.0 },
  { month: "July", category: "Transport", totalSpend: 302.0 },
  { month: "July", category: "EatingOutAndTreats", totalSpend: 362.0 },
  { month: "July", category: "GeneralRetail", totalSpend: 231.0 },
  { month: "July", category: "Fuel", totalSpend: 401.0 },
  { month: "July", category: "HomewareAndAppliances", totalSpend: 262.0 },
  { month: "July", category: "OutdoorAndAdventure", totalSpend: 225.0 },
  { month: "July", category: "DonationsAndGiving", totalSpend: 70.0 },

  { month: "August", category: "Groceries", totalSpend: 615.0 },
  { month: "August", category: "Transport", totalSpend: 311.0 },
  { month: "August", category: "EatingOutAndTreats", totalSpend: 382.0 },
  { month: "August", category: "GeneralRetail", totalSpend: 245.0 },
  { month: "August", category: "Fuel", totalSpend: 412.0 },
  { month: "August", category: "TravelAndHolidays", totalSpend: 910.0 },
  { month: "August", category: "CarUseAndServices", totalSpend: 352.0 },
  { month: "August", category: "Hobbies", totalSpend: 125.0 },

  { month: "September", category: "Groceries", totalSpend: 468.0 },
  { month: "September", category: "EatingOutAndTreats", totalSpend: 518.0 },
  { month: "September", category: "Transport", totalSpend: 400.0 },
  { month: "September", category: "GeneralRetail", totalSpend: 180.0 },
  { month: "September", category: "HomewareAndAppliances", totalSpend: 115.0 },
  { month: "September", category: "DonationsAndGiving", totalSpend: 250.0 },
  { month: "September", category: "ProfessionalServices", totalSpend: 150.0 },
  { month: "September", category: "Fuel", totalSpend: 365.0 },

  { month: "October", category: "Groceries", totalSpend: 512.0 },
  { month: "October", category: "EatingOutAndTreats", totalSpend: 430.0 },
  { month: "October", category: "Transport", totalSpend: 382.0 },
  { month: "October", category: "GeneralRetail", totalSpend: 240.0 },
  { month: "October", category: "ProfessionalServices", totalSpend: 410.0 },
  { month: "October", category: "Fuel", totalSpend: 392.0 },
  { month: "October", category: "MusicGamingApps", totalSpend: 39.99 },
  { month: "October", category: "PharmaciesAndWellbeing", totalSpend: 70.0 },

  { month: "November", category: "Groceries", totalSpend: 499.0 },
  { month: "November", category: "Transport", totalSpend: 295.0 },
  { month: "November", category: "EatingOutAndTreats", totalSpend: 305.0 },
  { month: "November", category: "GeneralRetail", totalSpend: 260.0 },
  { month: "November", category: "Fuel", totalSpend: 370.0 },
  { month: "November", category: "HomewareAndAppliances", totalSpend: 280.0 },
  { month: "November", category: "GiftsAndFlowers", totalSpend: 130.0 },
  { month: "November", category: "PharmaciesAndWellbeing", totalSpend: 85.0 },

  { month: "December", category: "Groceries", totalSpend: 640.0 },
  { month: "December", category: "Transport", totalSpend: 330.0 },
  { month: "December", category: "EatingOutAndTreats", totalSpend: 520.0 },
  { month: "December", category: "GeneralRetail", totalSpend: 420.0 },
  { month: "December", category: "Fuel", totalSpend: 405.0 },
  { month: "December", category: "TravelAndHolidays", totalSpend: 1500.0 },
  { month: "December", category: "GiftsAndFlowers", totalSpend: 350.0 },
  { month: "December", category: "OutdoorAndAdventure", totalSpend: 260.0 },
];

const MONTH_INDEX: Record<MonthName, number> = {
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
};

function prettyLabel(cat: string) {
  return cat.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("And", "&");
}

function getTopCategories(data: RawMonthly[], topN = 4): Category[] {
  const totals = new Map<Category, number>();
  for (const r of data) {
    if (r.category === "Other") continue;
    totals.set(r.category, (totals.get(r.category) ?? 0) + r.totalSpend);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat]) => cat);
}

function buildSeries(data: RawMonthly[], topCats: Category[]) {
  const months = [...new Set<MonthName>(data.map((d) => d.month))].sort(
    (a, b) => MONTH_INDEX[a] - MONTH_INDEX[b]
  );

  const key = (m: MonthName, c: Category) => `${m}__${c}`;
  const index = new Map<string, number>();
  for (const r of data) {
    index.set(
      key(r.month, r.category),
      (index.get(key(r.month, r.category)) ?? 0) + r.totalSpend
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

function buildChartConfig(topCats: Category[]): ChartConfig {
  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];
  const cfg: Record<string, { label: string; color: string }> = {};
  topCats.forEach((cat, i) => {
    cfg[cat] = { label: prettyLabel(cat), color: palette[i % palette.length] };
  });

  cfg["totalSpend"] = { label: "Total (month)", color: "transparent" };
  return cfg as ChartConfig;
}

export function ChartLineMultipleCategories() {
  const [curve, setCurve] = useState<"linear" | "natural" | "step">("linear");

  const { topCats, chartData, chartConfig } = useMemo(() => {
    const topCats = getTopCategories(rawMonthly, 4);
    const chartData = buildSeries(rawMonthly, topCats);
    const chartConfig = buildChartConfig(topCats) satisfies ChartConfig;
    return { topCats, chartData, chartConfig };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Top 4 Categories by Month</CardTitle>
          <CardDescription>Total spend per month per category</CardDescription>
        </div>

        <Select value={curve} onValueChange={(v) => setCurve(v as any)}>
          <SelectTrigger className="w-[140px]" id="curve-selector">
            <SelectValue placeholder="Line type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            {/* <SelectItem value="natural">Natural</SelectItem> */}
            {/* Removed due to misalignment */}
            <SelectItem value="step">Step</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            accessibilityLayer
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent labelFormatter={(label) => `${label}`} />
              }
            />

            {Object.keys(chartConfig)
              .filter((k) => k !== "totalSpend")
              .map((catKey) => (
                <Line
                  key={catKey}
                  type={curve}
                  dataKey={catKey}
                  name={
                    chartConfig[catKey as keyof ChartConfig]?.label as string
                  }
                  stroke={`var(--color-${catKey})`}
                  strokeWidth={2.5}
                  dot={{
                    fill: `var(--color-${catKey})`,
                  }}
                  activeDot={{ r: 6 }}
                />
              ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
