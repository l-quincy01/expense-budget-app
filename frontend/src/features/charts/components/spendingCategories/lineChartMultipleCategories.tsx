"use client";

import React, { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
import { Category, userMonthlyCategoryExpenditure } from "@/types/types";
import { prettyLabel } from "@/utils/labelPrettier";
import { getTopCategories } from "@/utils/chart/lineChart/categories/getTopCategories";
import { buildSeries } from "@/utils/chart/lineChart/categories/buildSeries";
import { ChartCard } from "@/features/charts/components/chart-card";
import { EmptyState } from "@/components/common/empty-state";

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

type ChartLineMultipleCategoriesProps = {
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export function LineChartMultipleCategories({
  monthlyCategoryExpenditure = [],
}: ChartLineMultipleCategoriesProps) {
  const [curve, setCurve] = useState<"linear" | "natural" | "step">("linear");

  const { chartData, chartConfig } = useMemo(() => {
    if (
      !monthlyCategoryExpenditure ||
      monthlyCategoryExpenditure.length === 0
    ) {
      return {
        topCats: [] as Category[],
        chartData: [] as Record<string, number | string>[],
        chartConfig: buildChartConfig([]) as ChartConfig,
      };
    }
    const top = getTopCategories(monthlyCategoryExpenditure, 4);
    const data = buildSeries(monthlyCategoryExpenditure, top);
    const cfg = buildChartConfig(top) as ChartConfig;
    return { chartData: data, chartConfig: cfg };
  }, [monthlyCategoryExpenditure]);

  const actions = (
    <Select
      value={curve}
      onValueChange={(v) => setCurve(v as "linear" | "natural" | "step")}
    >
      <SelectTrigger className="w-[140px]" id="curve-selector">
        <SelectValue placeholder="Line type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="linear">Linear</SelectItem>
        <SelectItem value="natural">Line</SelectItem>
        <SelectItem value="step">Step</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <ChartCard
      title="Top 4 Categories by Month"
      description="Total spend per month per category"
      actions={actions}
    >
        {chartData.length === 0 ? (
          <EmptyState message="No category data found yet." />
        ) : (
          <ChartContainer
            className="aspect-auto md:h-[400px] w-full"
            config={chartConfig}
          >
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
    </ChartCard>
  );
}
