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
import { categories, categoryMonthlyAggregate } from "@/types/types";
import { monthlyCategoryAggregate } from "@/types/data";

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
};

function prettyLabel(cat: string) {
  return cat.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("And", "&");
}

function getTopCategories(
  data: categoryMonthlyAggregate[],
  topN = 4
): categories[] {
  const totals = new Map<categories, number>();
  for (const r of data) {
    if (r.category === "Other") continue;
    totals.set(r.category, (totals.get(r.category) ?? 0) + r.totalSpend);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([cat]) => cat);
}

function buildSeries(data: categoryMonthlyAggregate[], topCats: categories[]) {
  const months = [...new Set<string>(data.map((d) => d.month))].sort(
    (a, b) => MONTH_INDEX[a] - MONTH_INDEX[b]
  );

  const key = (m: string, c: categories) => `${m}__${c}`;
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

function buildChartConfig(topCats: categories[]): ChartConfig {
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
    const topCats = getTopCategories(monthlyCategoryAggregate, 4);
    const chartData = buildSeries(monthlyCategoryAggregate, topCats);
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
