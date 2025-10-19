"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { ChartRadarDots } from "@/components/charts/radar-chart";
import { DataTable } from "@/components/data-table";
import { data } from "./data";

export default function Dashboard() {
  const api = useApi();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api("/api/profile").then(setMe).catch(console.error);
  }, [api]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <ChartRadarDots />
        <ChartRadarDots />
        <ChartRadarDots />
        <ChartRadarDots />
        <ChartRadarDots />
      </div>
      <DataTable data={data} />
    </div>
  );
}
