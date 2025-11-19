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

interface DeleteDashboardProps {
  dashboardName: string;
  onDeleted?: () => Promise<void> | void;
}

export default function DeleteDashboard({
  dashboardName,
  onDeleted,
}: DeleteDashboardProps) {
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleDelete = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!dashboardName) {
      const msg = "Dashboard name is required to delete.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await api<void>(`/api/dashboard/${encodeURIComponent(dashboardName)}`, {
        method: "DELETE",
      });
      toast.success(`Dashboard "${dashboardName}" deleted.`);
      await onDeleted?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete dashboard.";
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
            dashboard.
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
