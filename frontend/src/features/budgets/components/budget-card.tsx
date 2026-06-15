import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeleteBudget from "@/features/budgets/components/dialogs/delete-budget";
import EditBudgetDialog from "@/features/budgets/components/dialogs/edit-budget-dialog";
import { Budget, Category, categoryIcons } from "@/types/types";
import { formatCategoryName } from "@/lib/utils";
import { TriangleAlert, Utensils } from "lucide-react";

type BudgetCardProps = {
  budget: Budget;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  onChanged: () => Promise<void> | void;
};

function CategoryIcon({ category }: { category: Category | string }) {
  const iconKey = (category as Category) ?? "Other";
  const IconComponent = categoryIcons[iconKey as Category] ?? Utensils;
  return <IconComponent size={28} />;
}

export function BudgetCard({
  budget,
  spentAmount,
  remainingAmount,
  percentage,
  onChanged,
}: BudgetCardProps) {
  return (
    <Card className="py-2 px-0">
      <CardContent className="flex flex-col gap-0 w-full justify-center">
        <div className="flex flex-row justify-end p-0 items-start">
          <DeleteBudget budgetID={budget.id} onDeleted={onChanged} />
          <EditBudgetDialog
            budget={{
              id: budget.id,
              dashboardName: budget.dashboardName,
              category: budget.category,
              budgetAmount: budget.budgetAmount,
              spentAmount: budget.spentAmount,
            }}
            onBudgetUpdated={onChanged}
          />
        </div>

        <div className="flex flex-row items-center gap-4 justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="p-4 rounded-full bg-accent">
              <CategoryIcon category={budget.category} />
            </div>
            <div className="text-sm font-semibold break-words whitespace-normal">
              {formatCategoryName(budget.category)}
            </div>
          </div>
          <div className="text-lg font-bold">{budget.budgetAmount}</div>
        </div>

        <div className="flex flex-col gap-2 w-full my-4">
          <div className="flex flex-row items-center w-full justify-between text-xs text-muted-foreground">
            <div>Spent: {spentAmount.toFixed(2)}</div>
            <div>Remaining: {remainingAmount}</div>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <Progress value={percentage} />
            </TooltipTrigger>
            <TooltipContent>
              {percentage > 80 ? (
                <p className="inline-flex items-center">
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
}
