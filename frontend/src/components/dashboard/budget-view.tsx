import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownWideNarrow, Pencil, Plus, Utensils } from "lucide-react";

import { Progress } from "../ui/progress";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddBudgetDialog from "./Dialogs/add-budget-dialog";
import EditBudgetDialog from "./Dialogs/edit-budget-dialog";

export default function BudgetView() {
  return (
    <div className="space-y-2">
      <div className="gap-1">
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Top Budgets</SelectItem>
            <SelectItem value="past-performance">All Budgets</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full flex flex-row justify-end pr-2">
          <div
            className={`hover:bg-accent p-2 rounded-full cursor-pointer ${
              true ? "bg-transparent" : "bg-accent"
            }`}
          >
            <AddBudgetDialog />
          </div>

          <div
            className={`hover:bg-accent p-2 rounded-full ${
              true ? "bg-transparent" : "bg-accent"
            }`}
          >
            <ArrowDownWideNarrow />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 gap-4">
        <Card className="">
          <CardContent className="flex flex-col  w-full ">
            <div className=" self-end">
              <EditBudgetDialog />
            </div>
            <div className="flex flex-row items-center gap-4 justify-between">
              <div className="flex flex-row items-center gap-2">
                <div className="p-4 rounded-full bg-accent">
                  <Utensils size={28} />
                </div>
                <div className="text-lg font-semibold">Eating out </div>
              </div>
              <div className="text-xl font-bold">R2500</div>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="flex flex-row items-center w-full justify-between text-xs text-muted-foreground">
                <div>Spend: R584</div>
                <div>Remaining: R1916</div>
              </div>
              <Progress value={33} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
