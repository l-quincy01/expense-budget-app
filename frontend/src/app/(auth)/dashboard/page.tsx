"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { ChartRadarDots } from "@/components/charts/radar-chart";
import { DataTable } from "@/components/data-table";
import { data } from "./data";
import SimpleTable from "@/components/table/simple-table";
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
import { ChartAreaDefault } from "@/components/charts/chart-area-default";
import { ChartBarDefault } from "@/components/charts/chart-bar-default";
import SimpleTableManual from "@/components/table/simple-table-manual";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddTransactionDialog from "@/components/table/Dialog/add-transaction-dialog";

export default function Dashboard() {
  const api = useApi();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api("/api/profile").then(setMe).catch(console.error);
  }, [api]);

  return (
    <div className="flex flex-col gap-4 px-16">
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

      {/* <div className="grid grid-cols-3 gap-4">
        <ChartRadarDots />
        <ChartRadarDots />
        <ChartRadarDots />
      </div> */}

      <div className="grid grid-cols-2 gap-4">
        {" "}
        <ChartAreaDefault />
        <ChartLineLinear />
        <ChartLineMultiple />
        <ChartBarDefault />
        <ChartPieSeparatorNone />
      </div>

      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col gap-4 py-2 w-9/10">
          <div className="flex flex-row justify-between">
            <Select defaultValue="outline">
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="past-performance">Categories</SelectItem>
                <SelectItem value="key-personnel">Spend History</SelectItem>
              </SelectContent>
            </Select>
            <AddTransactionDialog />
          </div>

          {/* <SimpleTable /> */}
          <SimpleTableManual />
        </div>
      </div>
    </div>
  );
}
