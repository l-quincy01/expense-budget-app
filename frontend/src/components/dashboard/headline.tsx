import React, { useEffect, useState } from "react";

import {
  ArrowRightLeft,
  Badge,
  BanknoteArrowDown,
  BanknoteArrowUp,
  MoveRight,
  Wallet,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { overview, userMonthlyIncomeExpenseTransactions } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStatement from "./dialogs/statements-dialogs/add-statements";
import { calculateMonthlyTotals, monthlyTotals } from "@/utils/overviewHandler";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { FaBalanceScaleLeft, FaBalanceScaleRight } from "react-icons/fa";
import useDashboard from "@/hooks/useDashboard";
import { getClosingBalance } from "@/utils/overview/getDashboardBalances";
import { incomePercentageSpentMessage } from "@/utils/overview/incomePercentageSpent";
import { FaRegCreditCard } from "react-icons/fa";

type HeadlineProps = {
  headlineData: userMonthlyIncomeExpenseTransactions[];
};

export default function Headline({ headlineData = [] }: HeadlineProps) {
  const { data, loading, error } = useProfile();
  const [monthTab, setMonthTab] = useState<string | undefined>();
  const [overviewEntries, setOverviewEntries] = useState<monthlyTotals[]>([]);
  const { userDashboard } = useDashboard();

  useEffect(() => {
    if (headlineData.length > 0) {
      setOverviewEntries(calculateMonthlyTotals(headlineData));

      setMonthTab(calculateMonthlyTotals(headlineData)[0].month);
    }
  }, [headlineData]);

  if (loading) return <div>Loading profile…</div>;
  if (error || !data)
    return <div className="text-red-500">Failed to load profile</div>;

  const currentOverview = overviewEntries.find((o) => o.month === monthTab);

  const moneyIn = currentOverview?.moneyIn ?? 0;
  const moneyOut = currentOverview?.moneyOut ?? 0;

  const incomePercentageSpent = moneyIn > 0 ? (moneyOut / moneyIn) * 100 : 999;

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2 justify-start">
          <div className="text-4xl font-bold">Hi {data.firstName}</div>
          <div className="text-lg text-muted-foreground">
            Here&apos;s what&apos;s happening with your money. Let&apos;s manage
            your expense.
          </div>
        </div>
        <AddStatement />
      </div>

      {overviewEntries.length > 0 && (
        <Tabs value={monthTab} onValueChange={setMonthTab} className="w-full ">
          <TabsList className="flex flex-wrap">
            {overviewEntries.map((item, index) => (
              <TabsTrigger key={index} value={item.month}>
                {item.month}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 flex flex-row gap-4 ">
        <Card className="@container/card w-full">
          <CardHeader>
            <CardDescription>
              <p className="text-sm font-semibold">Money Out</p>
            </CardDescription>
            <CardTitle>
              <p className="font-bold text-2xl">R{moneyOut}</p>
            </CardTitle>
            <CardAction>
              <BanknoteArrowUp size={28} />
            </CardAction>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">24 Debit Transactions</div>
            <div className="line-clamp-1  gap-2 font-medium items-center flex">
              {/* Trending up this month <IconTrendingUp className="size-4" />
              Trending down this month <IconTrendingUp className="size-4" /> */}
              No Spending Trends <MoveRight className="size-4" />
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card w-full">
          <CardHeader>
            <CardDescription>
              <p className="text-sm font-semibold">Money In</p>
            </CardDescription>
            <CardTitle>
              <p className="font-bold text-2xl">R {moneyIn}</p>
            </CardTitle>
            <CardAction>
              <BanknoteArrowDown size={28} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">3 Credit Transactions</div>
            <div className="line-clamp-1  gap-2 font-medium items-center flex">
              {/* Trending up this month <IconTrendingUp className="size-4" />
              Trending down this month <IconTrendingUp className="size-4" /> */}
              No Spending Trends <MoveRight className="size-4" />
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card w-full">
          <CardHeader>
            <CardDescription>
              <p className="text-sm font-semibold">Closing Month Balance</p>
            </CardDescription>
            <CardTitle>
              {userDashboard?.userMonthlyIncomeExpenseTransactions && (
                <p className="font-bold text-2xl">
                  R {getClosingBalance(userDashboard, monthTab).toFixed(2)}
                </p>
              )}
            </CardTitle>

            <CardAction>
              <FaBalanceScaleLeft size={26} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Healthy</div>
            <div className="line-clamp-1  gap-2 font-medium items-center flex">
              {/* Trending up this month <IconTrendingUp className="size-4" />
              Trending down this month <IconTrendingUp className="size-4" /> */}
              No Spending Trends <MoveRight className="size-4" />
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card w-full">
          <CardHeader>
            <CardDescription>
              <p className="text-sm font-semibold">Spending Status</p>
            </CardDescription>
            <CardTitle>
              <p className="font-bold text-2xl">
                {incomePercentageSpentMessage(incomePercentageSpent)}
              </p>
            </CardTitle>

            <CardAction>
              <FaRegCreditCard size={26} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {incomePercentageSpent >= 999 ? (
              <div className="text-muted-foreground">n/a</div>
            ) : (
              <div className="text-muted-foreground">
                {incomePercentageSpent.toFixed(2)}% of Income Spent
              </div>
            )}
            <div className="line-clamp-1  gap-2 font-medium items-center flex">
              {/* Trending up this month <IconTrendingUp className="size-4" />
              Trending down this month <IconTrendingUp className="size-4" /> */}
              Spending Lower Than Usual <MoveRight className="size-4" />
            </div>
          </CardFooter>
        </Card>

        {/* <Card className="@container/card w-full">
          <CardHeader>
            <CardDescription>
              <p className="text-sm font-semibold"></p>
            </CardDescription>
            <CardTitle>
              <p className="font-bold text-2xl">
                R {currentOverview?.moneyIn ?? 0}
              </p>
            </CardTitle>
            <CardAction>
              <BanknoteArrowDown size={28} />
            </CardAction>
          </CardHeader>
        </Card> */}
      </div>

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-fit">
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

      </div> */}
    </div>
  );
}
