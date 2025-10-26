"use client";

import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  MessageCircle,
  Scale,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Area,
  AreaChart,
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
import { useState } from "react";

export const description = "A multiple line/area chart with controls";

const chartConfig = {
  desktop: {
    label: "Income",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Expense",
    color: "var(--chart-2)",
  },
  balance: {
    label: "Balance",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const rawData2 = [
  {
    month: "September",
    transactions: [
      { day: "30", income: 0, expense: 59.5 },
      { day: "30", income: 9782.33, expense: 0 },
      { day: "30", income: 0, expense: 135.0 },
      { day: "30", income: 0, expense: 0.0 },
    ],
  },
  {
    month: "October",
    transactions: [
      { day: "01", income: 0, expense: 53.0 },
      { day: "01", income: 0, expense: 74.0 },
      { day: "01", income: 0, expense: 112.0 },
      { day: "01", income: 0, expense: 400.0 },
      { day: "01", income: 0, expense: 410.41 },
      { day: "01", income: 0, expense: 2.0 },
      { day: "02", income: 0, expense: 250.0 },
      { day: "02", income: 0, expense: 1557.86 },
      { day: "04", income: 0, expense: 515.87 },
      { day: "04", income: 0, expense: 1.99 },
      { day: "07", income: 1569.0, expense: 0 },
      { day: "07", income: 0, expense: 379.0 },
      { day: "07", income: 0, expense: 467.91 },
      { day: "07", income: 0, expense: 529.0 },
      { day: "07", income: 0, expense: 7000.0 },
      { day: "07", income: 0, expense: 0.0 },
      { day: "10", income: 0, expense: 159.3 },
      { day: "10", income: 0, expense: 115.71 },
      { day: "11", income: 9.72, expense: 0 },
      { day: "11", income: 9.72, expense: 0 },
      { day: "11", income: 0, expense: 73.5 },
      { day: "11", income: 0, expense: 0.55 },
      { day: "11", income: 0, expense: 1.21 },
    ],
  },
];

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

const STARTING_BALANCE = 4347.7;

const chartData = (() => {
  const flat = rawData2.flatMap((m) =>
    m.transactions.map((t) => ({
      month: m.month,
      day: t.day,
      income: t.income,
      expense: t.expense,
    }))
  );

  flat.sort((a, b) => {
    const ma = MONTH_INDEX[a.month] ?? 0;
    const mb = MONTH_INDEX[b.month] ?? 0;
    if (ma !== mb) return ma - mb;
    return Number(a.day) - Number(b.day);
  });

  let running = STARTING_BALANCE;
  return flat.map((row) => {
    running = running + (row.income || 0) - (row.expense || 0);
    return {
      ...row,
      balance: Number(running.toFixed(2)),
      label: `${row.month.slice(0, 3)} ${row.day}`,
    };
  });
})();

export function ChartLineMultiple() {
  const [chartType, setChartType] = useState<any>("linear");
  const [areaChart, setAreaChart] = useState<boolean>(false);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Income vs Expense vs Balance</CardTitle>
          <CardDescription>Statement snapshot</CardDescription>
        </div>

        <div className="flex flex-row gap-2 items-center">
          <Select
            defaultValue="linear"
            onValueChange={(value) => setChartType(value)}
          >
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="chart-type-selector"
            >
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="step">Step</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            className={`${areaChart ? "bg-accent" : "bg-transparent"}`}
            onClick={() => setAreaChart((p) => !p)}
          >
            Area Chart
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          {areaChart ? (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Area
                dataKey="income"
                type={chartType}
                stroke="var(--color-desktop)"
                fill="var(--color-desktop)"
                fillOpacity={0.3}
                name="Income"
              />

              <Area
                dataKey="expense"
                type={chartType}
                stroke="var(--color-mobile)"
                fill="var(--color-mobile)"
                fillOpacity={0.3}
                name="Expense"
              />

              <Area
                dataKey="balance"
                type={chartType}
                stroke="var(--color-balance)"
                fill="var(--color-balance)"
                fillOpacity={0.2}
                name="Balance"
              />
            </AreaChart>
          ) : (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Line
                dataKey="income"
                type={chartType}
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={false}
                name="Income"
              />

              <Line
                dataKey="expense"
                type={chartType}
                stroke="var(--color-mobile)"
                strokeWidth={2}
                dot={false}
                name="Expense"
              />

              <Line
                dataKey="balance"
                type={chartType}
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={false}
                name="Balance"
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
