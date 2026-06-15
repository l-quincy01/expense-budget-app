"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prettyLabel } from "@/utils/labelPrettier";
import { useState } from "react";
import { Category, userMonthlyCategoryExpenditure } from "@/types/types";
import { sumCategoryTotalsByMonth } from "@/utils/chart/barchart/categories/sumCategoryTotalsByMonth";
import { ChartCard } from "@/features/charts/components/chart-card";
import { EmptyState } from "@/components/common/empty-state";

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
    useState<Category>("GeneralRetail");

  const chartData = sumCategoryTotalsByMonth(
    monthlyCategoryExpenditure,
    selectedCategory
  );

  const actions = (
    <div className="flex flex-col gap-1 items-start">
      <Select
        defaultValue={`${categoriesArray[0]}`}
        value={selectedCategory}
        onValueChange={(val: Category) => {
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
  );

  return (
    <ChartCard
      title="Spending By Category"
      description="Spending share by category"
      actions={actions}
      className=""
      headerClassName="flex flex-row justify-between items-start"
    >
        <ChartContainer
          className="aspect-auto md:h-[400px] w-full"
          config={chartConfig}
        >
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
            <EmptyState
              message="No Pending Data For Category"
              className="w-full h-full"
            />
          )}
        </ChartContainer>
    </ChartCard>
  );
}
