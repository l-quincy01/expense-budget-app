import React, { useState } from "react";
import { LineChartSpending } from "@/features/charts/components/spendingTrends/lineChartSpending";

import { LineChartIncomeExpenseBalance } from "@/features/charts/components/spendingTrends/lineChartIncomeExpenseBalance";

import { LineChartMultipleCategories } from "@/features/charts/components/spendingCategories/lineChartMultipleCategories";
import {
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "@/types/types";
import { RadarChartCategories } from "@/features/charts/components/spendingCategories/radarChartCategories";
import { sumCategoriesForChart } from "@/utils/chart/barchart/categories/sumCategories";
import { sumMonthsForChart } from "@/utils/sumMonths";
import { BarchartIncomeExpense } from "@/features/charts/components/spendingTrends/barchartIncomeExpense";
import { sumIncomeAndExpenses } from "@/utils/chart/barchart/incomeExpense/sumExpenses";
import { PieChartCategories } from "@/features/charts/components/spendingCategories/pieChartCategories";
import { BarChartCategories } from "@/features/charts/components/spendingCategories/barChartCategories";
import { mergeMonthlyTransactionsWithStartingBalance } from "@/utils/chart/lineChart/incomeExpense/mergeMonthlyTransactions";
import { ChartControls } from "@/features/charts/components/chart-controls";

type ChartsViewProps = {
  monthlyTransactions?: userMonthlyTransactions[];
  monthlyIncomeExpenseTransactions?: userMonthlyIncomeExpenseTransactions[];
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export default function ChartsView({
  monthlyTransactions = [],
  monthlyIncomeExpenseTransactions = [],
  monthlyCategoryExpenditure = [],
}: ChartsViewProps) {
  const [chartView, setChartView] = useState<"trends" | "categories">(
    "trends"
  );
  const [gridlayout, setGridlayout] = useState(false);

  return (
    <div className="space-y-4">
      <ChartControls
        view={chartView}
        onViewChange={setChartView}
        gridLayout={gridlayout}
        onToggleGridLayout={() => setGridlayout((p) => !p)}
      />

      {/* Trends Charts */}
      <div
        className={`grid ${gridlayout ? "grid-cols-2" : "grid-cols-1"} gap-4 `}
      >
        {chartView === "trends" && (
          <>
            <BarchartIncomeExpense
              incomeExpenseTotals={sumIncomeAndExpenses(
                mergeMonthlyTransactionsWithStartingBalance(
                  monthlyIncomeExpenseTransactions
                )
              )}
            />

            <LineChartSpending monthlyTransactions={monthlyTransactions} />
            <LineChartIncomeExpenseBalance
              monthlyIncomeExpenseTransactions={
                monthlyIncomeExpenseTransactions
              }
            />
          </>
        )}
        {/* Categories  Charts */}
        {chartView === "categories" && (
          <>
            <BarChartCategories
              monthlyCategoryExpenditure={monthlyCategoryExpenditure}
            />
            <PieChartCategories
              monthlyCategoryExpenditure={monthlyCategoryExpenditure}
            />
            <RadarChartCategories
              spendingCategories={sumCategoriesForChart(
                monthlyCategoryExpenditure
              )}
              spendingMonths={sumMonthsForChart(monthlyCategoryExpenditure)}
            />
            <LineChartMultipleCategories
              monthlyCategoryExpenditure={monthlyCategoryExpenditure}
            />
          </>
        )}
      </div>
    </div>
  );
}
