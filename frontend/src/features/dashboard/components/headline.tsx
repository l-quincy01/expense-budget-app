import React, { useEffect, useMemo, useState } from "react";

import {
  BanknoteArrowDown,
  BanknoteArrowUp,
} from "lucide-react";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { userMonthlyIncomeExpenseTransactions } from "@/types/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStatement from "@/features/statements/components/dialogs/add-statements";
import {
  calculateMonthlyTotals,
} from "@/utils/overview/calculateMonthlyTotals";
import { FaBalanceScaleLeft } from "react-icons/fa";
import { getClosingBalance } from "@/utils/overview/getDashboardBalances";
import { incomePercentageSpentMessage } from "@/utils/overview/incomePercentageSpent";
import { FaRegCreditCard } from "react-icons/fa";
import { Dashboard } from "@/types/types";
import { MetricCard } from "@/features/dashboard/components/metric-card";

type HeadlineProps = {
  headlineData: userMonthlyIncomeExpenseTransactions[];
  userDashboard: Dashboard;
  onStatementUploaded?: () => Promise<void> | void;
};

export default function Headline({
  headlineData = [],
  userDashboard,
  onStatementUploaded,
}: HeadlineProps) {
  const { data, loading, error } = useProfile();
  const [monthTab, setMonthTab] = useState<string | undefined>();
  const overviewEntries = useMemo(
    () => calculateMonthlyTotals(headlineData),
    [headlineData]
  );

  useEffect(() => {
    if (overviewEntries.length > 0) {
      setMonthTab(overviewEntries[0].month);
    }
  }, [overviewEntries]);

  if (loading) return <div>Loading profile…</div>;
  if (error || !data)
    return <div className="text-red-500">Failed to load profile</div>;

  const currentOverview = overviewEntries.find((o) => o.month === monthTab);

  const moneyIn = currentOverview?.moneyIn ?? 0;
  const moneyOut = currentOverview?.moneyOut ?? 0;

  const incomePercentageSpent = moneyIn > 0 ? (moneyOut / moneyIn) * 100 : 999;
  const closingBalance = userDashboard.userMonthlyIncomeExpenseTransactions
    ? `R ${getClosingBalance(userDashboard, monthTab).toFixed(2)}`
    : "";
  const spendingStatus = incomePercentageSpentMessage(incomePercentageSpent);
  const spendingMeta =
    incomePercentageSpent >= 999
      ? "n/a"
      : `${incomePercentageSpent.toFixed(2)}% of Income Spent`;

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
        <AddStatement onUploaded={onStatementUploaded} />
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
        <MetricCard
          title="Money Out"
          value={`R${moneyOut}`}
          icon={<BanknoteArrowUp size={28} />}
          meta="24 Debit Transactions"
          trend="No Spending Trends"
        />
        <MetricCard
          title="Money In"
          value={`R ${moneyIn}`}
          icon={<BanknoteArrowDown size={28} />}
          meta="3 Credit Transactions"
          trend="No Spending Trends"
        />
        <MetricCard
          title="Closing Month Balance"
          value={closingBalance}
          icon={<FaBalanceScaleLeft size={26} />}
          meta="Healthy"
          trend="No Spending Trends"
        />
        <MetricCard
          title="Spending Status"
          value={spendingStatus}
          icon={<FaRegCreditCard size={26} />}
          meta={spendingMeta}
          trend="Spending Lower Than Usual"
        />
      </div>
    </div>
  );
}
