/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";

import Headline from "@/components/dashboard/headline";
import BudgetView from "@/components/dashboard/budget-view";
import ChartsView from "@/components/dashboard/charts-view";
import TableView from "@/components/dashboard/table-view";

export default function Dashboard() {
  const api = useApi();
  const [, setMe] = useState<any>(null);

  useEffect(() => {
    api("/api/profile").then(setMe).catch(console.error);
  }, [api]);

  return (
    <div className="flex flex-col gap-8 px-16">
      <Headline />
      <BudgetView />
      <ChartsView />
      <TableView />
    </div>
  );
}
