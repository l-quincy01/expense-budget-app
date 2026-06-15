"use client";

import Headline from "@/components/dashboard/headline";
import BudgetView from "@/components/dashboard/views/budget-view";
import ChartsView from "@/components/dashboard/views/charts-view";
import TableView from "@/components/dashboard/views/table-view";
import { useDashboardContext } from "@/components/providers/dashboard-provider";

export default function DashboardDetailPage() {
  const {
    selectedDashboard,
    dashboardNames,
    selectedDashboardName,
    loading,
    error,
    refreshDashboard,
  } = useDashboardContext();

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

  if (!selectedDashboardName || !selectedDashboard) {
    return (
      <div className="px-6 py-8 text-muted-foreground">
        {dashboardNames.length
          ? "Dashboard not found. Please pick another dashboard from the sidebar."
          : "You do not have any dashboards yet. Create one to get started."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-16">
      <Headline
        headlineData={
          selectedDashboard.userMonthlyIncomeExpenseTransactions ?? []
        }
        userDashboard={selectedDashboard}
        onStatementUploaded={() => refreshDashboard(selectedDashboardName)}
      />
      <BudgetView
        categoriesExpenditure={
          selectedDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
      <ChartsView
        monthlyTransactions={selectedDashboard.userMonthlyTransactions ?? []}
        monthlyIncomeExpenseTransactions={
          selectedDashboard.userMonthlyIncomeExpenseTransactions ?? []
        }
        monthlyCategoryExpenditure={
          selectedDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
      <TableView
        monthlyTransactions={selectedDashboard.userMonthlyTransactions ?? []}
        monthlyCategoryExpenditure={
          selectedDashboard.userMonthlyCategoryExpenditure ?? []
        }
      />
    </div>
  );
}
