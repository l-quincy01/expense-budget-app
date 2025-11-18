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
import { useEffect, useMemo, useState } from "react";
import { userMonthlyIncomeExpenseTransactions } from "@/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const description = "A multiple line/area/bar chart with controls";

type ChartLineMultipleProps = {
  monthlyIncomeExpenseTransactions?: userMonthlyIncomeExpenseTransactions[];
};
type Range = "1m" | "3m" | "max";
type ActiveSeries = "all" | "income" | "expense" | "balance";

export function LineChartIncomeExpenseBalance({
  monthlyIncomeExpenseTransactions = [],
}: ChartLineMultipleProps) {
  const [chartType, setChartType] = useState<any>("linear");
  const [areaChart, setAreaChart] = useState<boolean>(false);
  const [range, setRange] = useState<Range>("max");
  const [windowStart, setWindowStart] = useState<number>(0);

  const [activeSeries, setActiveSeries] = useState<ActiveSeries>("all");

  const showIncome = activeSeries === "all" || activeSeries === "income";
  const showExpense = activeSeries === "all" || activeSeries === "expense";
  const showBalance = activeSeries === "all" || activeSeries === "balance";

  const toggleSeries = (series: Exclude<ActiveSeries, "all">) => {
    setActiveSeries((prev) => (prev === series ? "all" : series));
  };

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

  useEffect(() => {
    const totalMonths = monthlyIncomeExpenseTransactions.length;

    if (!totalMonths) {
      setWindowStart(0);
      return;
    }

    if (range === "max") {
      setWindowStart(0);
      return;
    }

    const monthsToShowRaw = range === "1m" ? 1 : 3;
    const monthsToShow = Math.min(monthsToShowRaw, totalMonths);
    const maxStartIndex = totalMonths - monthsToShow;

    setWindowStart(maxStartIndex);
  }, [monthlyIncomeExpenseTransactions, range]);

  const chartData = useMemo(() => {
    if (!monthlyIncomeExpenseTransactions.length) return [];

    const normalizedBlocks = monthlyIncomeExpenseTransactions.map((block) => ({
      month: block.month,
      startingBalance: block.startingBalance,
      transactions: [...(block.transactions ?? [])].sort(
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

    return visibleBlocks.flatMap((block) => {
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
  }, [monthlyIncomeExpenseTransactions, range, windowStart]);

  const totalMonths = monthlyIncomeExpenseTransactions.length;
  const monthsToShowRawNav =
    range === "1m" ? 1 : range === "3m" ? 3 : totalMonths;
  const monthsToShowNav = Math.min(monthsToShowRawNav, totalMonths);
  const maxStartIndexNav = Math.max(0, totalMonths - monthsToShowNav);

  const canGoPrev = range !== "max" && windowStart > 0;
  const canGoNext = range !== "max" && windowStart < maxStartIndexNav;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setWindowStart((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setWindowStart((prev) => {
      const total = monthlyIncomeExpenseTransactions.length;
      const monthsToShowRaw = range === "1m" ? 1 : range === "3m" ? 3 : total;
      const monthsToShow = Math.min(monthsToShowRaw, total);
      const maxStart = Math.max(0, total - monthsToShow);
      return Math.min(maxStart, prev + 1);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Income vs Expense vs Balance</CardTitle>
          <CardDescription>Statement snapshot</CardDescription>
        </div>

        <div className="flex flex-row gap-2 items-center">
          {!(chartType === "barMultiple") && (
            <Button
              variant="secondary"
              className={`${areaChart ? "bg-accent" : "bg-transparent"}`}
              onClick={() => setAreaChart((p) => !p)}
            >
              Area Chart
            </Button>
          )}

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
            No income/expense data available for this dashboard yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            onClick={() => {
              if (activeSeries !== "all") {
                setActiveSeries("all");
              }
            }}
          >
            {/* --- Bar Chart Multiple --- */}
            {chartType === "barMultiple" ? (
              <BarChart
                accessibilityLayer
                data={chartData}
                barSize={64}
                barGap={20}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={(d) => `${d.month.slice(0, 3)} ${d.day}`}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />

                {showIncome && (
                  <Bar
                    dataKey="income"
                    fill="var(--income-color)"
                    radius={1}
                    onClick={() => toggleSeries("income")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showExpense && (
                  <Bar
                    dataKey="expense"
                    fill="var(--expense-color)"
                    radius={1}
                    onClick={() => toggleSeries("expense")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showBalance && (
                  <Bar
                    dataKey="balance"
                    fill="var(--balance-color)"
                    radius={1}
                    onClick={() => toggleSeries("balance")}
                    style={{ cursor: "pointer" }}
                  />
                )}
                {/*            
                    <Bar
                      dataKey="income"
                      fill="var(--income-color)"
                      radius={1}
                    />
             

                <Bar dataKey="expense" fill="var(--expense-color)" radius={1} />
                <Bar dataKey="balance" fill="var(--balance-color)" radius={1} /> */}
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

                {showIncome && (
                  <Area
                    dataKey="income"
                    type={chartType}
                    stroke="var(--income-color)"
                    fill="var(--income-color)"
                    fillOpacity={0.3}
                    name="Income"
                    onClick={() => toggleSeries("income")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showExpense && (
                  <Area
                    dataKey="expense"
                    type={chartType}
                    stroke="var(--expense-color)"
                    fill="var(--expense-color)"
                    fillOpacity={0.3}
                    name="Expense"
                    onClick={() => toggleSeries("expense")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showBalance && (
                  <Area
                    dataKey="balance"
                    type={chartType}
                    stroke="var(--balance-color)"
                    fill="var(--balance-color)"
                    fillOpacity={0.2}
                    name="Balance"
                    onClick={() => toggleSeries("balance")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {/* <Area
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
                /> */}
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

                {showIncome && (
                  <Line
                    dataKey="income"
                    type={chartType}
                    stroke="var(--income-color)"
                    strokeWidth={2}
                    dot={false}
                    name="Income"
                    onClick={() => toggleSeries("income")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showExpense && (
                  <Line
                    dataKey="expense"
                    type={chartType}
                    stroke="var(--expense-color)"
                    strokeWidth={2}
                    dot={false}
                    name="Expense"
                    onClick={() => toggleSeries("expense")}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showBalance && (
                  <Line
                    dataKey="balance"
                    type={chartType}
                    stroke="var(--balance-color)"
                    strokeWidth={2}
                    dot={false}
                    name="Balance"
                    onClick={() => toggleSeries("balance")}
                    style={{ cursor: "pointer" }}
                  />
                )}
                {/* <Line
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
                /> */}
              </LineChart>
            )}
          </ChartContainer>
        )}

        <div className="w-full flex flex-row justify-between">
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
