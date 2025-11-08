import React, { useState } from "react";
import AddTransactionDialog from "../../table/Dialog/add-transaction-dialog";
import SimpleTableManual from "../../table/simple-table-manual";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { StatementTable } from "../../table/statement-table";
import {
  userMonthlyCategoryExpenditure,
  userMonthlyTransactions,
} from "@/types/types";

type TableViewProps = {
  monthlyTransactions?: userMonthlyTransactions[];
  monthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
};

export default function TableView({
  monthlyTransactions = [],
  monthlyCategoryExpenditure = [],
}: TableViewProps) {
  const [tableView, setTableView] = useState("categoryTable");

  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col gap-4 py-2 w-full">
          <div className="flex flex-row justify-between">
            <Select
              defaultValue="categoryTable"
              onValueChange={(v) => setTableView(v)}
            >
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="categoryTable">Categories Table</SelectItem>
                <SelectItem value="statementTable">Statement Table</SelectItem>
              </SelectContent>
            </Select>
            <AddTransactionDialog />
          </div>
          {tableView === "statementTable" && (
            <StatementTable monthlyTransactions={monthlyTransactions} />
          )}
          {tableView === "categoryTable" && (
            <SimpleTableManual
              monthlyCategoryExpenditure={monthlyCategoryExpenditure}
            />
          )}
        </div>
      </div>
    </div>
  );
}
