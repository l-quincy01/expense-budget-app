"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthlyIncomeExpenseTotals } from "@/utils/sumExpenses";
import { useState } from "react";

export const description = "A multiple bar chart";

const chartData = [{ month: "January", expense: 186 }];

interface props {
  incomeExpenseTotals: MonthlyIncomeExpenseTotals[];
}

type activeSeries = "all" | "expense" | "income";

export function BarchartIncomeExpense({ incomeExpenseTotals }: props) {
  const [activeSeries, setActiveSeries] = useState<activeSeries>("all");

  const chartConfig = {
    expenseTotal: {
      label: "Expenses",
      color: "var(--chart-5)",
    },
    incomeTotal: {
      label: "Income",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expense</CardTitle>
        <CardDescription>Snapshot of Income vs Expense (MoM)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={incomeExpenseTotals}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {(activeSeries == "all" || activeSeries == "expense") && (
              <Bar
                dataKey="expenseTotal"
                fill="var(--color-expenseTotal)"
                radius={4}
                onClick={() => {
                  if (activeSeries === "all") {
                    setActiveSeries("expense");
                  } else {
                    setActiveSeries("all");
                  }
                }}
              />
            )}
            {(activeSeries == "all" || activeSeries == "income") && (
              <Bar
                dataKey="incomeTotal"
                fill="var(--color-incomeTotal)"
                radius={4}
                onClick={() => {
                  if (activeSeries === "all") {
                    setActiveSeries("income");
                  } else {
                    setActiveSeries("all");
                  }
                }}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
