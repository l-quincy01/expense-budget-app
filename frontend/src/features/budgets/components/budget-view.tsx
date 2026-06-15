import React, { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AddBudgetDialog from "@/features/budgets/components/dialogs/add-budget-dialog";
import InfoBudgetView from "@/features/budgets/components/dialogs/info-budgetView";
import { Budget, Category, userMonthlyCategoryExpenditure } from "@/types/types";

import { useParams } from "next/navigation";
import { BudgetCard } from "@/features/budgets/components/budget-card";
import { EmptyState } from "@/components/common/empty-state";
import { useBudgetList } from "@/features/budgets/hooks/useBudgetList";

type BudgetViewContainerProps = {
  categoriesExpenditure: userMonthlyCategoryExpenditure[];
};

type BudgetViewMode = "topBudgets" | "allBudgets";

type BudgetViewProps = {
  dashboardName: string;
  budgets: Budget[];
  categoriesExpenditure: userMonthlyCategoryExpenditure[];
  budgetView: BudgetViewMode;
  onBudgetViewChange: (value: BudgetViewMode) => void;
  onBudgetsChanged: () => Promise<void> | void;
};

type PreparedBudget = {
  budget: Budget;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
};

/*----------- */

export default function BudgetViewContainer({
  categoriesExpenditure,
}: BudgetViewContainerProps) {
  const params = useParams();

  const dashboardName = params?.dashboardName as string;

  const [budgetView, setBudgetView] = useState<BudgetViewMode>("topBudgets");
  const { budgets, loading, error, refreshBudgets } =
    useBudgetList(dashboardName);

  if (loading) return <p>Loading budgets...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <BudgetView
      dashboardName={dashboardName}
      budgets={budgets}
      categoriesExpenditure={categoriesExpenditure}
      budgetView={budgetView}
      onBudgetViewChange={setBudgetView}
      onBudgetsChanged={refreshBudgets}
    />
  );
}

function getCategorySpentAmount(
  categoryArr: userMonthlyCategoryExpenditure[],
  categoryName: Category
): number {
  return categoryArr
    .filter((item) => item.category === categoryName)
    .reduce((sum, item) => sum + item.totalSpend, 0);
}

function getRemainingAmount(budget: Budget) {
  return Math.max(0, budget.budgetAmount - budget.spentAmount);
}

function getBudgetPercentage(spentAmount: number, budgetAmount: number) {
  if (budgetAmount <= 0) return 0;
  return (spentAmount / budgetAmount) * 100;
}

function prepareBudgets(
  budgets: Budget[],
  categoriesExpenditure: userMonthlyCategoryExpenditure[],
  mode: BudgetViewMode
): PreparedBudget[] {
  const visibleBudgets =
    mode === "topBudgets"
      ? [...budgets].sort((a, b) => b.budgetAmount - a.budgetAmount).slice(0, 6)
      : budgets;

  return visibleBudgets.map((budget) => {
    const spentAmount =
      mode === "topBudgets"
        ? getCategorySpentAmount(categoriesExpenditure, budget.category)
        : budget.spentAmount;

    return {
      budget,
      spentAmount,
      remainingAmount: getRemainingAmount(budget),
      percentage: getBudgetPercentage(spentAmount, budget.budgetAmount),
    };
  });
}

export function BudgetView({
  dashboardName,
  budgets,
  categoriesExpenditure,
  budgetView,
  onBudgetViewChange,
  onBudgetsChanged,
}: BudgetViewProps) {
  const preparedBudgets = prepareBudgets(
    budgets,
    categoriesExpenditure,
    budgetView
  );

  return (
    <div className="space-y-2">
      <div className="gap-1">
        <Select
          value={budgetView}
          onValueChange={(value) => {
            onBudgetViewChange(value as BudgetViewMode);
          }}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="topBudgets">Top Budgets</SelectItem>
            <SelectItem value="allBudgets">All Budgets</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full flex flex-row justify-end pr-2">
          <div
            className={`hover:bg-accent p-2 rounded-full cursor-pointer ${
              true ? "bg-transparent" : "bg-accent"
            }`}
          >
            <AddBudgetDialog
              dashboardName={dashboardName}
              onBudgetCreated={onBudgetsChanged}
            />
          </div>

          <div className={`hover:bg-accent p-2 rounded-full`}>
            <InfoBudgetView />
          </div>
        </div>
      </div>

      {preparedBudgets.length !== 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  gap-4">
          {preparedBudgets.map((item) => (
            <BudgetCard
              key={item.budget.id}
              budget={item.budget}
              spentAmount={item.spentAmount}
              remainingAmount={item.remainingAmount}
              percentage={item.percentage}
              onChanged={onBudgetsChanged}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Add Bugets to Get Started." />
      )}
    </div>
  );
}
