import React, { useState } from "react";
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
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { prettyLabel } from "@/utils/labelPrettier";

interface EditBudgetDialogProps {
  budget: {
    id: string;
    dashboardName: string;
    category: string;
    budgetAmount: number;
    spentAmount: number;
  };
  onBudgetUpdated?: () => Promise<void> | void;
}

export default function EditBudgetDialog({
  budget,
  onBudgetUpdated,
}: EditBudgetDialogProps) {
  const api = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(String(budget.budgetAmount ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setAmount(String(budget.budgetAmount ?? ""));
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Budget amount must be a positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api(`/api/budgets/${budget.id}`, {
        method: "PUT",
        body: JSON.stringify({
          dashboardName: budget.dashboardName,
          category: budget.category,
          budgetAmount: parsedAmount,
          spentAmount: budget.spentAmount,
        }),
      });

      toast.success(`Updated budget for ${prettyLabel(budget.category)}.`);
      setIsOpen(false);
      await onBudgetUpdated?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update the budget.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="hover:bg-accent p-2 rounded-2xl cursor-pointer">
            <Pencil size={14} />
          </button>
        </DialogTrigger>

        <DialogContent className="w-sm">
          <DialogHeader>
            <DialogTitle>{prettyLabel(budget.category)}</DialogTitle>
            <DialogDescription>
              Adjust your set budget amount.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="BudgetValue">Amount</Label>
              <Input
                id="BudgetValue"
                placeholder="R2500"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
