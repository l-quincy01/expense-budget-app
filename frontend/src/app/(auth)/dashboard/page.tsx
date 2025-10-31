"use client";

import Headline from "@/components/dashboard/headline";
import BudgetView from "@/components/dashboard/views/budget-view";
import ChartsView from "@/components/dashboard/views/charts-view";
import TableView from "@/components/dashboard/views/table-view";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 px-16">
      <Headline />
      <BudgetView />
      <ChartsView />
      <TableView />
    </div>
  );
}
