import React from "react";
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

export default function ChartsView() {
  return (
    <div className="space-y-4">
      <Select defaultValue="outline">
        <SelectTrigger
          className="flex w-fit @4xl/main:hidden"
          size="sm"
          id="view-selector"
        >
          <SelectValue placeholder="Select a view" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="outline">Spend Line Graph</SelectItem>
          <SelectItem value="past-performance">
            Spend Share By Category
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Analysis Charts */}
      <div className="grid grid-cols-2 gap-4">
        {" "}
        <ChartLineLinear />
        <ChartLineMultiple />
        <ChartBarDefault />
        <ChartPieSeparatorNone />
      </div>
    </div>
  );
}
