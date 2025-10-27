import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartLineLinear } from "@/components/charts/chart-line-linear";
import { ChartPieSeparatorNone } from "@/components/charts/chart-pie-separator-none";
import { ChartLineMultiple } from "@/components/charts/chart-line-multiple";

import { ChartBarDefault } from "@/components/charts/chart-bar-default";

import { ChartData } from "@/types/chart";
import { LayoutGrid } from "lucide-react";
import { ChartLineMultipleCategories } from "../charts/chart-line-multiple-categories";

export default function ChartsView() {
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

      {/* Analysis Charts */}
      <div className={`grid grid-cols-${gridlayout ? "2" : "1"} gap-4`}>
        {" "}
        {chartView === "trends" && (
          <>
            <ChartLineLinear />
            <ChartLineMultiple />
          </>
        )}
        {chartView === "categories" && (
          <>
            {/* <ChartLineLinear />
            <ChartLineMultiple /> */}
            <ChartLineMultipleCategories />
            {/* <ChartBarDefault /> */}

            <ChartPieSeparatorNone />
          </>
        )}
      </div>
    </div>
  );
}
