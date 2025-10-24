"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A simple area chart";

const rawData = [
  {
    month: "September",
    transactions: [
      { day: "30", amount: 59.5 },
      { day: "30", amount: 9782.33 },
      { day: "30", amount: 135.0 },
    ],
  },
  {
    month: "October",
    transactions: [
      { day: "01", amount: -53.0 },
      { day: "01", amount: -74.0 },
      { day: "01", amount: -112.0 },
      { day: "01", amount: -400.0 },
      { day: "01", amount: -410.41 },
      { day: "01", amount: -2.0 },
      { day: "02", amount: -250.0 },
      { day: "02", amount: 1557.86 },
      { day: "04", amount: -515.87 },
      { day: "04", amount: -1.99 },
      { day: "07", amount: -1569.0 },
      { day: "07", amount: -379.0 },
      { day: "07", amount: -467.91 },
      { day: "07", amount: -529.0 },
      { day: "07", amount: -7000.0 },
      { day: "10", amount: -159.3 },
      { day: "10", amount: -115.71 },
      { day: "11", amount: -9.72 },
      { day: "11", amount: -9.72 },
      { day: "11", amount: -73.5 },
      { day: "11", amount: -0.55 },
      { day: "11", amount: -1.21 },
    ],
  },
];

const chartData = rawData.flatMap((m) =>
  m.transactions.map((t) => ({
    month: m.month,
    day: t.day,
    amount: t.amount,
  }))
);

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartAreaDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={(d) => `${d.month.slice(0, 3)}-${d.day}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
