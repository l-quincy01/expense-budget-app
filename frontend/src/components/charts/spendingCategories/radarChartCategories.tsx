"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
import { radarMonthsChartData } from "@/utils/sumMonths";
import { radarCategoriesChartData } from "@/utils/sumCategories";

export const description = "A radar chart with dots";

interface props {
  spendingCategories: radarCategoriesChartData[];
  spendingMonths: radarMonthsChartData[];
}

export function RadarChartCategories({
  spendingCategories = [],
  spendingMonths = [],
}: props) {
  const chartConfig = {
    category: {
      label: "Category",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="  border-[0.5px] px-1 ">
      <CardHeader className="flex flex-col justify-center  px-4">
        <CardTitle>Spending overview</CardTitle>
        <CardDescription>Overview of Spending</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 px-0 py-0 w-full grid grid-cols-2 ">
        <ChartContainer config={chartConfig} className=" px-0 py-0">
          <RadarChart data={spendingCategories}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="total"
              fill="var(--color-category)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
        {spendingMonths.length == 0 ? (
          <></>
        ) : (
          <ChartContainer config={chartConfig} className=" px-0 py-0">
            <RadarChart data={spendingMonths}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="month" />
              <PolarGrid />
              <Radar
                dataKey="total"
                fill="var(--color-category)"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
