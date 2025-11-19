import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChartSpending } from "@/components/charts/spendingTrends/lineChartSpending";

import { LineChartIncomeExpenseBalance } from "@/components/charts/spendingTrends/lineChartIncomeExpenseBalance";

import { LayoutGrid } from "lucide-react";
import { LineChartMultipleCategories } from "../../charts/spendingCategories/lineChartMultipleCategories";
import {
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "@/types/types";
import { RadarChartCategories } from "@/components/charts/spendingCategories/radarChartCategories";
import { sumCategoriesForChart } from "@/utils/sumCategories";
import { sumMonthsForChart } from "@/utils/sumMonths";
import { BarchartIncomeExpense } from "@/components/charts/spendingTrends/barchartIncomeExpense";
import { sumIncomeAndExpenses } from "@/utils/sumExpenses";
import { PieChartCategories } from "@/components/charts/spendingCategories/pieChartCategories";
import { BarChartCategories } from "@/components/charts/spendingCategories/barChartCategories";

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
  const [chartView, setChartView] = useState("trends");
  const [gridlayout, setGridlayout] = useState(false);

  return (
    <div className="space-y-4">
      <div className="w-full flex flex-row justify-between">
        <Select
          defaultValue="trends"
          onValueChange={(value) => {
            setChartView(value);
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
            <SelectItem value="trends">Spending Trends</SelectItem>
            <SelectItem value="categories">Spending Categories</SelectItem>
          </SelectContent>
        </Select>

        <div
          className={`hover:bg-accent p-2 rounded-full ${
            !gridlayout ? "bg-transparent" : "bg-accent"
          }`}
          onClick={() => setGridlayout((p) => !p)}
        >
          <LayoutGrid />
        </div>
      </div>

      {/* Trends Charts */}
      <div
        className={`grid ${gridlayout ? "grid-cols-2" : "grid-cols-1"} gap-4`}
      >
        {chartView === "trends" && (
          <>
            <BarchartIncomeExpense
              incomeExpenseTotals={sumIncomeAndExpenses(
                monthlyIncomeExpenseTransactions
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
