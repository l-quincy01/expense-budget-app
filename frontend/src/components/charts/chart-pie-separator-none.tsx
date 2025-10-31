// "use client";

// import { TrendingUp } from "lucide-react";
// import { Pie, PieChart } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
// } from "@/components/ui/chart";
// import { pieChartData } from "@/types/data";
// import { pieChart } from "@/types/types";

// export function aggregateTopCategories(data: pieChart[]): pieChart[] {
//   const aggregated = data.reduce<Record<string, pieChart>>((acc, curr) => {
//     if (!acc[curr.category]) {
//       acc[curr.category] = { ...curr };
//     } else {
//       acc[curr.category].totalSpend += curr.totalSpend;
//     }
//     return acc;
//   }, {});

//   const sorted = Object.values(aggregated).sort(
//     (a, b) => b.totalSpend - a.totalSpend
//   );

//   const top4 = sorted.slice(0, 4);

//   const others = sorted.slice(4);
//   const otherTotal = others.reduce((sum, c) => sum + c.totalSpend, 0);

//   if (otherTotal > 0) {
//     top4.push({
//       category: "Other",
//       totalSpend: otherTotal,
//       fill: "var(--color-Other)",
//     });
//   }

//   return top4;
// }

// const chartData = aggregateTopCategories(pieChartData);

// const chartConfig = {
//   totalSpend: {
//     label: "Total Spend",
//   },
//   GeneralRetail: {
//     label: "General Retail",
//     color: "var(--chart-1)",
//   },
//   Transport: {
//     label: "Transport",
//     color: "var(--chart-2)",
//   },
//   EatingOutAndTreats: {
//     label: "Eating Out & Treats",
//     color: "var(--chart-3)",
//   },
//   Fuel: {
//     label: "Fuel",
//     color: "var(--chart-4)",
//   },
//   Groceries: {
//     label: "Groceries",
//     color: "var(--chart-5)",
//   },
//   ProfessionalServices: {
//     label: "Professional Services",
//     color: "var(--chart-6)",
//   },
//   CarUseAndServices: {
//     label: "Car Use & Services",
//     color: "var(--chart-7)",
//   },
//   DonationsAndGiving: {
//     label: "Donations & Giving",
//     color: "var(--chart-8)",
//   },
//   GiftsAndFlowers: {
//     label: "Gifts & Flowers",
//     color: "var(--chart-9)",
//   },
//   Hobbies: {
//     label: "Hobbies",
//     color: "var(--chart-10)",
//   },
//   HomewareAndAppliances: {
//     label: "Homeware & Appliances",
//     color: "var(--chart-11)",
//   },
//   MusicGamingApps: {
//     label: "Music, Gaming & Apps",
//     color: "var(--chart-12)",
//   },
//   OutdoorAndAdventure: {
//     label: "Outdoor & Adventure",
//     color: "var(--chart-13)",
//   },
//   PharmaciesAndWellbeing: {
//     label: "Pharmacies & Wellbeing",
//     color: "var(--chart-14)",
//   },
//   TravelAndHolidays: {
//     label: "Travel & Holidays",
//     color: "var(--chart-1)",
//   },
//   Other: {
//     label: "Other",
//     color: "var(--chart-15)",
//   },
// } satisfies ChartConfig;

// export function ChartPieSeparatorNone() {
//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Spend Categories</CardTitle>
//         <CardDescription>Top 5 spending categories</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square max-h-[250px]"
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
//               stroke="0"
//             />
//             <ChartLegend
//               content={<ChartLegendContent nameKey="category" />}
//               className=""
//             />
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
