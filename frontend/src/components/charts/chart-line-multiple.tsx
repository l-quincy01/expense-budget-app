/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { userMonthlyIncomeExpenseTransactions } from "@/types/types";

export const description = "A multiple line/area/bar chart with controls";

type ChartLineMultipleProps = {
  monthlyIncomeExpenseTransactions?: userMonthlyIncomeExpenseTransactions[];
};

export function ChartLineMultiple({
  monthlyIncomeExpenseTransactions = [],
}: ChartLineMultipleProps) {
  const [chartType, setChartType] = useState<any>("linear");
  const [areaChart, setAreaChart] = useState<boolean>(false);

  const isBarChart = chartType === "barMultiple";

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

  const chartData = (() => {
    const monthOrder = (month: string) => MONTH_INDEX[month] ?? 99;

    const normalizedBlocks = monthlyIncomeExpenseTransactions
      .map((block) => ({
        month: block.month,
        startingBalance: block.startingBalance,
        transactions: [...(block.transactions ?? [])].sort(
          (a, b) => Number(a.day) - Number(b.day)
        ),
      }))
      .sort((a, b) => {
        const ma = monthOrder(a.month);
        const mb = monthOrder(b.month);
        if (ma !== mb) return ma - mb;
        return 0;
      });

    return normalizedBlocks.flatMap((block) => {
      let running = block.startingBalance;
      return block.transactions.map((transaction) => {
        running =
          running + (transaction.income || 0) - (transaction.expense || 0);
        return {
          month: block.month,
          day: transaction.day,
          income: transaction.income,
          expense: transaction.expense,
          balance: Number(running.toFixed(2)),
        };
      });
    });
  })();

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
        {chartData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No income/expense data available for this dashboard yet.
          </div>
        ) : (
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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

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
        )}
      </CardContent>
    </Card>
  );
}
