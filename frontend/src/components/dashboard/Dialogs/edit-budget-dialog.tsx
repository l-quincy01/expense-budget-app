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

export default function EditBudgetDialog() {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      updatedAmount: amount,
    });
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button className="p-0 cursor-pointer">
            <Pencil size={14} />
          </button>
        </DialogTrigger>

        <DialogContent className="w-sm">
          <DialogHeader>
            <DialogTitle>Budget Name</DialogTitle>
            <DialogDescription>Adjust your set budget</DialogDescription>
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

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="submit">Submit</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
