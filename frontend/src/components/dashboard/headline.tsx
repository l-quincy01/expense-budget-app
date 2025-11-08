import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { overview as OverviewEntry } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HeadlineProps = {
  overview?: OverviewEntry[];
};

export default function Headline({ overview = [] }: HeadlineProps) {
  const { data, loading, error } = useProfile();

  const overviewEntries =
    overview.length > 0
      ? overview
      : [
          {
            month: "Overview",
            moneyIn: 0,
            moneyOut: 0,
            startingBalance: 0,
            totalBudget: 0,
          },
        ];
  const latestEntry = overviewEntries[overviewEntries.length - 1];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(value ?? 0);

  if (loading) return <div>Loading profile…</div>;
  if (error || !data)
    return <div className="text-red-500">Failed to load profile</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 justify-start">
        <div className="text-4xl font-bold">Hi {data.firstName}</div>
        <div className="text-lg text-muted-foreground">
          Here&apos;s what&apos;s happening with your money. Let&apos;s manage
          your expense.
        </div>
      </div>

      <Tabs
        defaultValue={overviewEntries[0]?.month ?? "Overview"}
        className="w-full md:w-[400px]"
      >
        <TabsList className="flex flex-wrap">
          {overviewEntries.map((item) => (
            <TabsTrigger key={item.month} value={item.month}>
              July
            </TabsTrigger>
          ))}
        </TabsList>
        {overviewEntries.map((item) => (
          <TabsContent key={item.month} value={item.month}>
            <div className="text-sm text-muted-foreground">
              Money in {formatCurrency(item.moneyIn)} • Money out{" "}
              {formatCurrency(item.moneyOut)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-fit">
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Money Out</p>
              <p className="font-bold text-2xl">
                {formatCurrency(latestEntry.moneyOut)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <BanknoteArrowDown size={28} />
            </div>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Money In</p>
              <p className="font-bold text-2xl">
                {formatCurrency(latestEntry.moneyIn)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <BanknoteArrowUp size={28} />
            </div>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Budget Set</p>
              <p className="font-bold text-2xl">
                {formatCurrency(latestEntry.totalBudget ?? 0)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <Wallet size={28} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
