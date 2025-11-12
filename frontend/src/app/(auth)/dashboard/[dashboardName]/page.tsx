"use client";

import Headline from "@/components/dashboard/headline";
import BudgetView from "@/components/dashboard/views/budget-view";
import ChartsView from "@/components/dashboard/views/charts-view";
import TableView from "@/components/dashboard/views/table-view";
import useDashboard from "@/hooks/useDashboard";

export default function DashboardDetailPage() {
  const {
    userDashboard,
    userDashboardNames,
    selectedDashboardName,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return (
      <div className="px-6 py-8 text-muted-foreground">Loading dashboard…</div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8 text-red-500">
        Failed to load dashboard: {error}
      </div>
    );
  }

  if (!selectedDashboardName || !userDashboard) {
    return (
      <div className="px-6 py-8 text-muted-foreground">
        {userDashboardNames.length
          ? "Dashboard not found. Please pick another dashboard from the sidebar."
          : "You do not have any dashboards yet. Create one to get started."}
      </div>
    );
  }

  console.log(
    "----",
    "\n",
    userDashboard.userMonthlyIncomeExpenseTransactions,
    "\n",
    "------"
  );

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-16">
      <Headline
        headlineData={userDashboard.userMonthlyIncomeExpenseTransactions ?? []}
      />
      <BudgetView
        categoriesExpenditure={
          userDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
      <ChartsView
        monthlyTransactions={userDashboard.userMonthlyTransactions ?? []}
        monthlyIncomeExpenseTransactions={
          userDashboard.userMonthlyIncomeExpenseTransactions ?? []
        }
        monthlyCategoryExpenditure={
          userDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
      <TableView
        monthlyTransactions={userDashboard.userMonthlyTransactions ?? []}
        monthlyCategoryExpenditure={
          userDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
    </div>
  );
}
