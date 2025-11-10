import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { overview } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HeadlineProps = {
  overview?: overview[];
};

export default function Headline({ overview = [] }: HeadlineProps) {
  const { data, loading, error } = useProfile();
  const [monthTab, setMonthTab] = useState<string | undefined>();
  const [overviewEntries, setOverviewEntries] = useState<overview[]>([]);

  useEffect(() => {
    if (overview.length > 0) {
      setOverviewEntries(overview);
      setMonthTab(overview[0].month);
    }
  }, [overview]);

  if (loading) return <div>Loading profile…</div>;
  if (error || !data)
    return <div className="text-red-500">Failed to load profile</div>;

  const currentOverview = overviewEntries.find((o) => o.month === monthTab);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 justify-start">
        <div className="text-4xl font-bold">Hi {data.firstName}</div>
        <div className="text-lg text-muted-foreground">
          Here&apos;s what&apos;s happening with your money. Let&apos;s manage
          your expense.
        </div>
      </div>

      {overviewEntries.length > 0 && (
        <Tabs
          value={monthTab}
          onValueChange={setMonthTab}
          className="w-full md:w-[400px]"
        >
          <TabsList className="flex flex-wrap">
            {overviewEntries.map((item) => (
              <TabsTrigger key={item.month} value={item.month}>
                {item.month}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-fit">
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Money Out</p>
              <p className="font-bold text-2xl">
                {currentOverview?.moneyOut ?? 0}
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
                {currentOverview?.moneyIn ?? 0}
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
              <p className="font-bold text-2xl">N/A</p>
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
