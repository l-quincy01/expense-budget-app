"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ChartData = {
  category: string;
  totalSpend: number;
  fill: string;
};

type categories =
  | "GeneralRetail"
  | "Transport"
  | "EatingOutAndTreats"
  | "Fuel"
  | "Groceries"
  | "ProfessionalServices"
  | "CarUseAndServices"
  | "DonationsAndGiving"
  | "GiftsAndFlowers"
  | "Hobbies"
  | "HomewareAndAppliances"
  | "MusicGamingApps"
  | "OutdoorAndAdventure"
  | "PharmaciesAndWellbeing"
  | "TravelAndHolidays";

interface pieData {
  category: categories;
  totalSpend: number;
  fill: string;
}
interface chartData {
  month: string;
  category: categories;
  totalSpend: number;
  fill: string;
}

export const description = "A pie chart with no separator";

export const chartData2 = [
  {
    category: "GeneralRetail",
    totalSpend: 180,
    fill: "var(--color-GeneralRetail)",
  },
  {
    category: "Transport",
    totalSpend: 400,
    fill: "var(--color-Transport)",
  },
  {
    category: "EatingOutAndTreats",
    totalSpend: 518,
    fill: "var(--color-EatingOutAndTreats)",
  },
  {
    category: "Fuel",
    totalSpend: 0,
    fill: "var(--color-Fuel)",
  },
  {
    category: "Groceries",
    totalSpend: 468, // Checkers, Takealot groceries
    fill: "var(--color-Groceries)",
  },
  {
    category: "ProfessionalServices",
    totalSpend: 410, // ChatGPT sub
    fill: "var(--color-ProfessionalServices)",
  },
  {
    category: "CarUseAndServices",
    totalSpend: 0,
    fill: "var(--color-CarUseAndServices)",
  },
  {
    category: "DonationsAndGiving",
    totalSpend: 250, // Payment to Bro Lesego
    fill: "var(--color-DonationsAndGiving)",
  },
  {
    category: "GiftsAndFlowers",
    totalSpend: 0,
    fill: "var(--color-GiftsAndFlowers)",
  },
  {
    category: "Hobbies",
    totalSpend: 0,
    fill: "var(--color-Hobbies)",
  },
  {
    category: "HomewareAndAppliances",
    totalSpend: 115, // Microsoft purchase
    fill: "var(--color-HomewareAndAppliances)",
  },
  {
    category: "MusicGamingApps",
    totalSpend: 0,
    fill: "var(--color-MusicGamingApps)",
  },
  {
    category: "OutdoorAndAdventure",
    totalSpend: 0,
    fill: "var(--color-OutdoorAndAdventure)",
  },
  {
    category: "PharmaciesAndWellbeing",
    totalSpend: 0,
    fill: "var(--color-PharmaciesAndWellbeing)",
  },
  {
    category: "TravelAndHolidays",
    totalSpend: 0,
    fill: "var(--color-TravelAndHolidays)",
  },
  {
    category: "Other",
    totalSpend: 80, // Service Fees, Byc Debit, Misc
    fill: "var(--color-Other)",
  },
];

export function aggregateTopCategories(data: ChartData[]): ChartData[] {
  // 1️⃣ Aggregate totals per category
  const aggregated = data.reduce<Record<string, ChartData>>((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = { ...curr };
    } else {
      acc[curr.category].totalSpend += curr.totalSpend;
    }
    return acc;
  }, {});

  // 2️⃣ Convert to array and sort descending by totalSpend
  const sorted = Object.values(aggregated).sort(
    (a, b) => b.totalSpend - a.totalSpend
  );

  // 3️⃣ Take top 4
  const top4 = sorted.slice(0, 4);

  // 4️⃣ Combine remaining into "Other"
  const others = sorted.slice(4);
  const otherTotal = others.reduce((sum, c) => sum + c.totalSpend, 0);

  if (otherTotal > 0) {
    top4.push({
      category: "Other",
      totalSpend: otherTotal,
      fill: "var(--color-Other)",
    });
  }

  return top4;
}

const chartData3 = aggregateTopCategories(chartData2);

const chartConfig = {
  totalSpend: {
    label: "Total Spend",
  },
  GeneralRetail: {
    label: "General Retail",
    color: "var(--chart-1)",
  },
  Transport: {
    label: "Transport",
    color: "var(--chart-2)",
  },
  EatingOutAndTreats: {
    label: "Eating Out & Treats",
    color: "var(--chart-3)",
  },
  Fuel: {
    label: "Fuel",
    color: "var(--chart-4)",
  },
  Groceries: {
    label: "Groceries",
    color: "var(--chart-5)",
  },
  ProfessionalServices: {
    label: "Professional Services",
    color: "var(--chart-6)",
  },
  CarUseAndServices: {
    label: "Car Use & Services",
    color: "var(--chart-7)",
  },
  DonationsAndGiving: {
    label: "Donations & Giving",
    color: "var(--chart-8)",
  },
  GiftsAndFlowers: {
    label: "Gifts & Flowers",
    color: "var(--chart-9)",
  },
  Hobbies: {
    label: "Hobbies",
    color: "var(--chart-10)",
  },
  HomewareAndAppliances: {
    label: "Homeware & Appliances",
    color: "var(--chart-11)",
  },
  MusicGamingApps: {
    label: "Music, Gaming & Apps",
    color: "var(--chart-12)",
  },
  OutdoorAndAdventure: {
    label: "Outdoor & Adventure",
    color: "var(--chart-13)",
  },
  PharmaciesAndWellbeing: {
    label: "Pharmacies & Wellbeing",
    color: "var(--chart-14)",
  },
  TravelAndHolidays: {
    label: "Travel & Holidays",
    color: "var(--chart-1)",
  },
  Other: {
    label: "Other",
    color: "var(--chart-15)",
  },
} satisfies ChartConfig;

export function ChartPieSeparatorNone() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spend Categories</CardTitle>
        <CardDescription>Top 5 spending categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData3}
              dataKey="totalSpend"
              nameKey="category"
              stroke="0"
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className=""
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
