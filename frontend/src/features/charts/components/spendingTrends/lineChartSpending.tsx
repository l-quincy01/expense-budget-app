"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from "recharts";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { userMonthlyTransactions } from "@/types/types";
import { useChartWindowRange } from "@/features/charts/hooks/useChartWindowRange";

type ChartLineLinearProps = {
  monthlyTransactions?: userMonthlyTransactions[];
};

type LineChartType = "linear" | "natural" | "step";
type SpendingChartType = LineChartType | "barChart";

export function LineChartSpending({
  monthlyTransactions = [],
}: ChartLineLinearProps) {
  const [chartType, setChartType] = useState<SpendingChartType>("linear");
  const [areaChart, setAreaChart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    range,
    setRange,
    windowStart,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useChartWindowRange(monthlyTransactions.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!monthlyTransactions.length) return [];

    const normalizedBlocks = monthlyTransactions.map((m) => ({
      month: m.month,
      transactions: [...(m.transactions ?? [])].sort(
        (a, b) => Number(a.day) - Number(b.day)
      ),
    }));

    const totalMonths = normalizedBlocks.length;
    let visibleBlocks = normalizedBlocks;

    if (range !== "max") {
      const monthsToShowRaw = range === "1m" ? 1 : 3;
      const monthsToShow = Math.min(monthsToShowRaw, totalMonths);
      const maxStartIndex = Math.max(0, totalMonths - monthsToShow);

      const start = Math.min(Math.max(0, windowStart), maxStartIndex);
      const end = start + monthsToShow;

      visibleBlocks = normalizedBlocks.slice(start, end);
    }

    return visibleBlocks.flatMap((block) =>
      block.transactions.map((t) => ({
        month: block.month,
        day: t.day,
        amount: t.amount,
      }))
    );
  }, [monthlyTransactions, range, windowStart]);

  if (!mounted)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="line-clamp-1">Spend Line Chart</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
      </Card>
    );

  const chartConfig = {
    amount: {
      label: "Amount ",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle className="line-clamp-1">Spend Line Chart</CardTitle>
          <CardDescription className="line-clamp-1">
            Transactions snapshot
          </CardDescription>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Select
            defaultValue="linear"
            onValueChange={(value) => setChartType(value as SpendingChartType)}
          >
            <SelectTrigger className="flex w-fit">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="natural">Line</SelectItem>
              <SelectItem value="step">Step</SelectItem>
              <SelectItem value="barChart">Bar</SelectItem>
            </SelectContent>
          </Select>

          {chartType !== "barChart" && (
            <Button
              variant="secondary"
              className={areaChart ? "bg-accent" : "bg-transparent"}
              onClick={() => setAreaChart((p) => !p)}
            >
              Area Chart
            </Button>
          )}

          <div className="flex flex-row gap-2">
            <Button
              variant="secondary"
              className={range === "1m" ? "bg-accent" : "bg-transparent"}
              onClick={() => setRange("1m")}
            >
              1m
            </Button>
            <Button
              variant="secondary"
              className={range === "3m" ? "bg-accent" : "bg-transparent"}
              onClick={() => setRange("3m")}
            >
              3m
            </Button>
            <Button
              variant="secondary"
              className={range === "max" ? "bg-accent" : "bg-transparent"}
              onClick={() => setRange("max")}
            >
              Max
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No transaction data available for this dashboard yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto md:h-[400px] w-full"
          >
            {chartType === "barChart" ? (
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
              </BarChart>
            ) : areaChart ? (
              <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="amount"
                  type={chartType as LineChartType}
                  fill="var(--color-amount)"
                  fillOpacity={0.4}
                  stroke="var(--color-amount)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="amount"
                  type={chartType as LineChartType}
                  stroke="var(--color-amount)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ChartContainer>
        )}

        <div className="w-full flex flex-row justify-between mt-4">
          <Button
            variant="secondary"
            className={range === "max" ? "bg-accent" : "bg-transparent"}
            disabled={!canGoPrev}
            onClick={handlePrev}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            className={range === "max" ? "bg-accent" : "bg-transparent"}
            disabled={!canGoNext}
            onClick={handleNext}
          >
            <ChevronRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
