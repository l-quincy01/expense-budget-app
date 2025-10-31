/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useState } from "react";
import { userMonthlyIncomeExpenseTransactionsData } from "@/types/data";

export const description = "A multiple line/area/bar chart with controls";

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--income-color)",
  },
  expense: {
    label: "Expense",
    color: "var(--expense-color)",
  },
  balance: {
    label: "Balance",
    color: "var(--balance-color)",
  },
} satisfies ChartConfig;

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

const STARTING_BALANCE = 4347.7; //<----- MUST CHANGE

const chartData = (() => {
  const flat = userMonthlyIncomeExpenseTransactionsData.flatMap((m) =>
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
    };
  });
})();

export function ChartLineMultiple() {
  const [chartType, setChartType] = useState<any>("linear");
  const [areaChart, setAreaChart] = useState<boolean>(false);

  const isBarChart = chartType === "barMultiple";

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

              <SelectItem value="step">Step</SelectItem>
              <SelectItem value="barMultiple">Bar Multiple</SelectItem>
            </SelectContent>
          </Select>

          {!isBarChart && (
            <Button
              variant="secondary"
              className={`${areaChart ? "bg-accent" : "bg-transparent"}`}
              onClick={() => setAreaChart((p) => !p)}
            >
              Area Chart
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          {/* --- Bar Chart Multiple --- */}
          {isBarChart ? (
            <BarChart
              accessibilityLayer
              data={chartData}
              barSize={64}
              barGap={20}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={(d) => `${d.month.slice(0, 3)}-${d.day}`}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="income" fill="var(--income-color)" radius={1} />
              <Bar dataKey="expense" fill="var(--expense-color)" radius={1} />
              <Bar dataKey="balance" fill="var(--balance-color)" radius={1} />
            </BarChart>
          ) : areaChart ? (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Area
                dataKey="income"
                type={chartType}
                stroke="var(--income-color)"
                fill="var(--income-color)"
                fillOpacity={0.3}
                name="Income"
              />

              <Area
                dataKey="expense"
                type={chartType}
                stroke="var(--expense-color)"
                fill="var(--expense-color)"
                fillOpacity={0.3}
                name="Expense"
              />

              <Area
                dataKey="balance"
                type={chartType}
                stroke="var(--balance-color)"
                fill="var(--balance-color)"
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
                dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Line
                dataKey="income"
                type={chartType}
                stroke="var(--income-color)"
                strokeWidth={2}
                dot={false}
                name="Income"
              />

              <Line
                dataKey="expense"
                type={chartType}
                stroke="var(--expense-color)"
                strokeWidth={2}
                dot={false}
                name="Expense"
              />

              <Line
                dataKey="balance"
                type={chartType}
                stroke="var(--balance-color)"
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
