import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/lib/api";
import { categories, budgets } from "@/types/types";
import { toast } from "sonner";

const CATEGORY_OPTIONS: categories[] = [
  "GeneralRetail",
  "Transport",
  "EatingOutAndTreats",
  "Fuel",
  "Groceries",
  "ProfessionalServices",
  "CarUseAndServices",
  "DonationsAndGiving",
  "GiftsAndFlowers",
  "Hobbies",
  "HomewareAndAppliances",
  "MusicGamingApps",
  "OutdoorAndAdventure",
  "PharmaciesAndWellbeing",
  "TravelAndHolidays",
  "Other",
];

const formatCategoryLabel = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2").trim();

type AddBudgetDialogProps = {
  dashboardName: string;
  onBudgetCreated?: (budget: budgets) => void;
};

export default function AddBudgetDialog({
  dashboardName,
  onBudgetCreated,
}: AddBudgetDialogProps) {
  const api = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<categories>("GeneralRetail");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormError(null);
      setAmount("");
      setCategory("GeneralRetail");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!dashboardName) {
      setFormError("Select a dashboard first.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Budget amount must be a positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        dashboardName,
        category,
        budgetAmount: parsedAmount,
        spentAmount: 0,
      };

      const created = await api<budgets>("/api/budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onBudgetCreated?.(created);
      setAmount("");
      setCategory("GeneralRetail");
      setIsOpen(false);
      toast.success(
        `Budget for ${formatCategoryLabel(created.category)} created.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create the budget.";
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
          <Button size="icon" variant="ghost">
            <Plus />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-sm">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>Add a new budget</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as categories)}
              >
                <SelectTrigger className="flex w-full" id="category" size="sm">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent id="view-selector-content">
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatCategoryLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="BudgetValue">Budget Amount</Label>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
