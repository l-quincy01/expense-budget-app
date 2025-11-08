"use client";

import React, { useMemo, useState } from "react";
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

function normalizeMonth(m: string) {
  if (MONTH_INDEX[m] != null) return m;
  const abbr = (m || "").slice(0, 3);
  return ABBR_TO_FULL[abbr] ?? m;
}

function prettyLabel(cat: string) {
  return cat.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("And", "&");
}

function getTopCategories(
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

function buildSeries(
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

type ChartLineMultipleCategoriesProps = {
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export function ChartLineMultipleCategories({
  monthlyCategoryExpenditure = [],
}: ChartLineMultipleCategoriesProps) {
  const [curve, setCurve] = useState<"linear" | "natural" | "step">("linear");

  const { chartData, chartConfig } = useMemo(() => {
    if (
      !monthlyCategoryExpenditure ||
      monthlyCategoryExpenditure.length === 0
    ) {
      return {
        topCats: [] as categories[],
        chartData: [] as Record<string, number | string>[],
        chartConfig: buildChartConfig([]) as ChartConfig,
      };
    }
    const top = getTopCategories(monthlyCategoryExpenditure, 4);
    const data = buildSeries(monthlyCategoryExpenditure, top);
    const cfg = buildChartConfig(top) as ChartConfig;
    return { chartData: data, chartConfig: cfg };
  }, [monthlyCategoryExpenditure]);

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
            <SelectItem value="natural">Natural</SelectItem>
            <SelectItem value="step">Step</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No category data found yet.
          </div>
        ) : (
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
                .map((catKey) => {
                  const configEntry =
                    chartConfig[catKey as keyof ChartConfig] ?? {};
                  const color =
                    (configEntry as { color?: string }).color ??
                    "var(--chart-1)";
                  return (
                    <Line
                      key={catKey}
                      type={curve}
                      dataKey={catKey}
                      name={(configEntry as { label?: string }).label ?? catKey}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={{ fill: color }}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
