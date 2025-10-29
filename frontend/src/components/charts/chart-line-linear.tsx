"use client";

import { useState, useEffect } from "react";
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
import { Button } from "../ui/button";
import { transactionsLedger } from "@/types/data";

const chartData = transactionsLedger.flatMap((m) =>
  m.transactions.map((t) => ({
    month: m.month,
    day: t.day,
    amount: t.amount,
  }))
);

const chartConfig = {
  amount: {
    label: "Amount ",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartLineLinear() {
  const [chartType, setChartType] = useState("linear");
  const [areaChart, setAreaChart] = useState(false);
  const [mounted, setMounted] = useState(false);

  //  Recharts SSR issue
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Spend Line Chart</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
      </Card>
    );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Spend Line Chart</CardTitle>
          <CardDescription>Transactions snapshot</CardDescription>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Select defaultValue="linear" onValueChange={setChartType}>
            <SelectTrigger className="flex w-fit">
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              {/* Removed due to misalignment */}
              {/* <SelectItem value="natural">Natural</SelectItem> */}

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
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
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
                type={chartType}
                fill="var(--color-amount)"
                fillOpacity={0.4}
                stroke="var(--color-amount)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
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
                type={chartType}
                stroke="var(--color-amount)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
