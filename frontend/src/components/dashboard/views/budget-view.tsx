import React, { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownWideNarrow, TriangleAlert, Utensils } from "lucide-react";

import { Progress } from "../../ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import AddBudgetDialog from "../dialogs/add-budget-dialog";
import EditBudgetDialog from "../dialogs/edit-budget-dialog";
import DeleteBudget from "../dialogs/delete-budget";
import InfoBudgetView from "../dialogs/info-budgetView";
import { Button } from "../../ui/button";
import { budgets, categories, categoryIcons } from "@/types/types";
import { userBudgets } from "@/types/data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BudgetViewProps = {
  budgets?: budgets[];
};

export default function BudgetView({ budgets = [] }: BudgetViewProps) {
  const [budgetView, setBudgetView] = useState("topBudgets");

  const Icon = (category: categories | string) => {
    const iconKey = (category as categories) ?? "Other";
    const IconComponent = categoryIcons[iconKey as categories] ?? Utensils;
    return <IconComponent size={28} />;
  };

  function formatCategoryName(category: string): string {
    return category.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  }

  const displayBudgets = useMemo(() => {
    if (budgets.length === 0) return userBudgets;
    return budgets;
  }, [budgets]);

  return (
    <div className="space-y-2">
      <div className="gap-1">
        <Select
          defaultValue="topBudgets"
          onValueChange={(value) => {
            setBudgetView(value);
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
            <SelectItem value="topBudgets">Top Budgets</SelectItem>
            <SelectItem value="allBudgets">All Budgets</SelectItem>
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
            <Button size="icon" variant="ghost">
              <ArrowDownWideNarrow />
            </Button>
          </div>
          <div className={`hover:bg-accent p-2 rounded-full`}>
            <InfoBudgetView />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 gap-4">
        {budgetView === "topBudgets" &&
          [...displayBudgets]
            .sort((a, b) => b.budgetAmount - a.budgetAmount)
            .slice(0, 6)
            .map((budget, index) => {
              const percentage =
                (budget.spentAmount / budget.budgetAmount) * 100;
              return (
                <Card className="py-2 px-0" key={index}>
                  <CardContent className="flex flex-col gap-0 w-full justify-center">
                    <div className="flex flex-row justify-end p-0 items-start">
                      <DeleteBudget />
                      <EditBudgetDialog />
                    </div>

                    <div className="flex flex-row items-center gap-4 justify-between">
                      <div className="flex flex-row items-center gap-2">
                        <div className="p-4 rounded-full bg-accent">
                          {Icon(budget.category)}
                        </div>
                        <div className="text-sm font-semibold break-words whitespace-normal">
                          {formatCategoryName(budget.category)}
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {budget.budgetAmount}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full my-4">
                      <div className="flex flex-row items-center w-full justify-between text-xs text-muted-foreground">
                        <div>Spent: {budget.spentAmount}</div>
                        <div>
                          Remaining:{" "}
                          {budget.budgetAmount - budget.spentAmount < 0 ? (
                            <>0</>
                          ) : (
                            <>{budget.budgetAmount - budget.spentAmount}</>
                          )}{" "}
                        </div>
                      </div>

                      <Tooltip>
                        <TooltipTrigger>
                          {" "}
                          <Progress value={percentage} />
                        </TooltipTrigger>
                        <TooltipContent>
                          {percentage > 80 ? (
                            <p className="inline-flex items-center">
                              {" "}
                              <TriangleAlert size={12} />
                              You have spent over 80% of your budget
                            </p>
                          ) : (
                            <p>You are within your budget goals</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        {budgetView == "allBudgets" &&
          displayBudgets.map((budget, index) => {
            const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
            return (
              <Card className="py-2 px-0" key={index}>
                <CardContent className="flex flex-col gap-0 w-full justify-center">
                  <div className="flex flex-row justify-end p-0 items-start">
                    <DeleteBudget />
                    <EditBudgetDialog />
                  </div>

                  <div className="flex flex-row items-center gap-4 justify-between">
                    <div className="flex flex-row items-center gap-2">
                      <div className="p-4 rounded-full bg-accent">
                        {Icon(budget.category)}
                      </div>
                      <div className="text-sm font-semibold break-words whitespace-normal">
                        {formatCategoryName(budget.category)}
                      </div>
                    </div>
                    <div className="text-lg font-bold">
                      {budget.budgetAmount}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full my-4">
                    <div className="flex flex-row items-center w-full justify-between text-xs text-muted-foreground">
                      <div>Spent: {budget.spentAmount}</div>
                      <div>
                        Remaining:{" "}
                        {budget.budgetAmount - budget.spentAmount < 0 ? (
                          <>0</>
                        ) : (
                          <>{budget.budgetAmount - budget.spentAmount}</>
                        )}{" "}
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        {" "}
                        <Progress value={percentage} />
                      </TooltipTrigger>
                      <TooltipContent>
                        {percentage > 80 ? (
                          <p className="inline-flex items-center">
                            {" "}
                            <TriangleAlert size={12} />
                            You have spent over 80% of your budget
                          </p>
                        ) : (
                          <p>You are within your budget goals</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
