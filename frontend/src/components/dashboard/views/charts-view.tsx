import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartLineLinear } from "@/components/charts/chart-line-linear";

import { ChartLineMultiple } from "@/components/charts/chart-line-multiple";

import { LayoutGrid } from "lucide-react";
import { ChartLineMultipleCategories } from "../../charts/chart-line-multiple-categories";
import {
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "@/types/types";

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
            <ChartLineLinear monthlyTransactions={monthlyTransactions} />
            <ChartLineMultiple
              monthlyIncomeExpenseTransactions={
                monthlyIncomeExpenseTransactions
              }
            />
          </>
        )}
        {/* Categories  Charts */}
        {chartView === "categories" && (
          <>
            <ChartLineMultipleCategories
              monthlyCategoryExpenditure={monthlyCategoryExpenditure}
            />
            {/* <ChartPieSeparatorNone /> */}
          </>
        )}
      </div>
    </div>
  );
}
