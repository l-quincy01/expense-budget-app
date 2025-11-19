// "use client";

// import { Label, Pie, PieChart } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartLegend,
//   ChartLegendContent,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { useMemo, useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { userMonthlyCategoryExpenditure } from "@/types/types";
// import { sumMonthAllCategoryTotals } from "@/utils/sumCategories";

// interface props {
//   monthlyCategoryExpenditure: userMonthlyCategoryExpenditure[];
// }

// export function ChartPieLegend({ monthlyCategoryExpenditure }: props) {
//   const chartConfig = {
//     GeneralRetail: {
//       label: "General Retail",
//     },
//     Transport: {
//       label: "Transport",
//     },
//     EatingOutAndTreats: {
//       label: "Eating Out & Treats",
//     },
//     Fuel: {
//       label: "Fuel",
//     },
//     Groceries: {
//       label: "Groceries",
//     },
//     ProfessionalServices: {
//       label: "Professional Services",
//     },
//     CarUseAndServices: {
//       label: "Car Use & Services",
//     },
//     DonationsAndGiving: {
//       label: "Donations & Giving",
//     },
//     GiftsAndFlowers: {
//       label: "Gifts & Flowers",
//     },
//     Hobbies: {
//       label: "Hobbies",
//     },
//     HomewareAndAppliances: {
//       label: "Homeware & Appliances",
//     },
//     MusicGamingApps: {
//       label: "Music, Gaming & Apps",
//     },
//     OutdoorAndAdventure: {
//       label: "Outdoor & Adventure",
//     },
//     PharmaciesAndWellbeing: {
//       label: "Pharmacies & Wellbeing",
//     },
//     TravelAndHolidays: {
//       label: "Travel & Holidays",
//     },
//     Other: {
//       label: "Other",
//     },
//   } satisfies ChartConfig;

//   const monthArr = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const [selectedMonth, setSelectedMonth] = useState(
//     monthlyCategoryExpenditure[0].month
//   );

//   const chartData = sumMonthAllCategoryTotals(
//     monthlyCategoryExpenditure,
//     selectedMonth
//   );

//   const monthTotalSpend = useMemo(() => {
//     return chartData.reduce((acc, curr) => acc + curr.totalSpend, 0);
//   }, [chartData]);

//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Pie Chart - Legend</CardTitle>
//         <CardDescription>January - June 2024</CardDescription>

//         <Select
//           value={selectedMonth}
//           onValueChange={(value) => setSelectedMonth(value)}
//         >
//           <SelectTrigger className="w-[140px]">
//             <SelectValue placeholder="Select a category" />
//           </SelectTrigger>
//           <SelectContent>
//             {monthArr.map((month, index) => (
//               <SelectItem key={index} value={`${month}`}>
//                 {month}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[300px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />

//             <Pie
//               data={chartData}
//               dataKey="totalSpend"
//               nameKey="category"
//               innerRadius={60}
//               strokeWidth={5}
//             >
//               <Label
//                 content={({ viewBox }) => {
//                   if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                     return (
//                       <text
//                         x={viewBox.cx}
//                         y={viewBox.cy}
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                       >
//                         <tspan
//                           x={viewBox.cx}
//                           y={viewBox.cy}
//                           className="fill-foreground text-3xl font-bold"
//                         >
//                           {monthTotalSpend.toLocaleString()}
//                         </tspan>
//                         <tspan
//                           x={viewBox.cx}
//                           y={(viewBox.cy || 0) + 24}
//                           className="fill-muted-foreground"
//                         >
//                           ZAR
//                         </tspan>
//                       </text>
//                     );
//                   }
//                 }}
//               />
//             </Pie>
//             <ChartLegend
//               content={<ChartLegendContent nameKey="category" />}
//               className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
//             />
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import { Label, Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userMonthlyCategoryExpenditure } from "@/types/types";
import { sumMonthAllCategoryTotals } from "@/utils/sumCategories";

interface props {
  monthlyCategoryExpenditure: userMonthlyCategoryExpenditure[];
}

export function PieChartCategories({ monthlyCategoryExpenditure }: props) {
  const chartConfig = {
    GeneralRetail: { label: "General Retail" },
    Transport: { label: "Transport" },
    EatingOutAndTreats: { label: "Eating Out & Treats" },
    Fuel: { label: "Fuel" },
    Groceries: { label: "Groceries" },
    ProfessionalServices: { label: "Professional Services" },
    CarUseAndServices: { label: "Car Use & Services" },
    DonationsAndGiving: { label: "Donations & Giving" },
    GiftsAndFlowers: { label: "Gifts & Flowers" },
    Hobbies: { label: "Hobbies" },
    HomewareAndAppliances: { label: "Homeware & Appliances" },
    MusicGamingApps: { label: "Music, Gaming & Apps" },
    OutdoorAndAdventure: { label: "Outdoor & Adventure" },
    PharmaciesAndWellbeing: { label: "Pharmacies & Wellbeing" },
    TravelAndHolidays: { label: "Travel & Holidays" },
    Other: { label: "Other" },
  } satisfies ChartConfig;

  const monthArr = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedMonth, setSelectedMonth] = useState(
    monthlyCategoryExpenditure[0]?.month ?? "January"
  );

  const chartData = sumMonthAllCategoryTotals(
    monthlyCategoryExpenditure,
    selectedMonth
  );

  const monthTotalSpend = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalSpend, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Legend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>

        <Select
          value={selectedMonth}
          onValueChange={(value) => setSelectedMonth(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {monthArr.map((month, index) => (
              <SelectItem key={index} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          {chartData.length !== 0 ? (
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              <Pie
                data={chartData}
                dataKey="totalSpend"
                nameKey="category"
                innerRadius={60}
                strokeWidth={1}
                className="p-2 "
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="p-2"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {monthTotalSpend.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            ZAR
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>

              <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              No Spending data
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
