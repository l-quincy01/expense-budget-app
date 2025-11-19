"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prettyLabel } from "@/utils/labelPrettier";
import { useEffect, useState } from "react";
import { categories, userMonthlyCategoryExpenditure } from "@/types/types";
import { sumCategoryTotalsByMonth } from "@/utils/sumCategories";

export const description = "A bar chart with a label";

interface props {
  monthlyCategoryExpenditure: userMonthlyCategoryExpenditure[];
}

export function BarChartCategories({ monthlyCategoryExpenditure }: props) {
  const categoriesArray = [
    "GeneralRetail",
    "Transport",
    "EatingOutAndTreats",
    "Fuel",
    "Groceries",
    "ProfessionalServices",
    "CarUseAndServices",
    "DonationsAndGiving",
    "GiftsAndFlowers",
    "Hobbies",
    "HomewareAndAppliances",
    "MusicGamingApps",
    "OutdoorAndAdventure",
    "PharmaciesAndWellbeing",
    "TravelAndHolidays",
    "Other",
  ];

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
    category: {
      label: "category",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const [selectedCategory, setSelectedCategory] =
    useState<categories>("GeneralRetail");

  const chartData = sumCategoryTotalsByMonth(
    monthlyCategoryExpenditure,
    selectedCategory
  );

  console.log(chartData);

  //   useEffect(() => {
  // const chartData = sumCategoryTotalsByMonth(monthlyCategoryExpenditure, selectedCategory)
  //   }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Spending By Category</CardTitle>
          <CardDescription>Spending share by category</CardDescription>
        </div>
        <div className="flex flex-col gap-1 items-start">
          <Select
            defaultValue={`${categoriesArray[0]}`}
            value={selectedCategory}
            onValueChange={(val: categories) => {
              setSelectedCategory(val);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <>
                  {categoriesArray.map((categoryName, index) => (
                    <SelectItem key={index} value={`${categoryName}`}>
                      {prettyLabel(categoryName)}
                    </SelectItem>
                  ))}
                </>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer className="pt-4" config={chartConfig}>
          {chartData.length != 0 ? (
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
              }}
            >
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
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="totalSpend" fill="var(--color-category)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              No Pending Data For Category
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
