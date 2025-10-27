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

export default function ChartsView() {
  const [chartView, setChartView] = useState("lineChart");

  return (
    <div className="space-y-4">
      <Select
        defaultValue="lineChart"
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
          <SelectItem value="lineChart"> Line Chart</SelectItem>
          <SelectItem value="allCharts">All Charts</SelectItem>
        </SelectContent>
      </Select>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 gap-4">
        {" "}
        {chartView === "lineChart" && (
          <>
            <ChartLineLinear />
            <ChartLineMultiple />
          </>
        )}
        {chartView === "allCharts" && (
          <>
            <ChartLineLinear />
            <ChartLineMultiple />
            <ChartBarDefault />
            <ChartPieSeparatorNone />
          </>
        )}
      </div>
    </div>
  );
}
