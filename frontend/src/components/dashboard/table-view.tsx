import React from "react";
import AddTransactionDialog from "../table/Dialog/add-transaction-dialog";
import SimpleTableManual from "../table/simple-table-manual";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SimpleTable from "../table/simple-table";
import { StatementTable } from "../table/statement-table";

export default function TableView() {
  return (
    <div>
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col gap-4 py-2 w-9/10">
          <div className="flex flex-row justify-between">
            <Select defaultValue="category">
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Categories</SelectItem>
                <SelectItem value="statement">Spend History</SelectItem>
              </SelectContent>
            </Select>
            <AddTransactionDialog />
          </div>
          <StatementTable />
          {/* <SimpleTable />
          <SimpleTableManual />  */}
        </div>
      </div>
    </div>
  );
}
