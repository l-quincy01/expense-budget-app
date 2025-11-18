import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApi } from "@/lib/api";
import { Trash } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

interface DeleteBudgetProps {
  budgetID: string;
  onDeleted?: () => Promise<void> | void;
}
export default function DeleteBudget({
  budgetID,
  onDeleted,
}: DeleteBudgetProps) {
  const fetchApi = useApi();

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!budgetID) {
      const msg = "Budget ID is required to delete.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchApi<void>(`/api/budgets/${budgetID}`, {
        method: "DELETE",
      });

      toast.success(`Budget successfully deleted.`);
      await onDeleted?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete the budget.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="hover:bg-accent p-2 rounded-2xl cursor-pointer">
        <Trash size={14} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            budget.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {formError && (
            <p className="text-sm text-destructive mr-auto">{formError}</p>
          )}
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isSubmitting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
