"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddTransactionDialog() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;

    const newErrors: typeof errors = {};
    if (title.trim().length < 2)
      newErrors.title = "Title must be at least 2 characters.";
    if (!amount) newErrors.amount = "Amount is required.";
    else if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0)
      newErrors.amount = "Enter a valid positive amount (2 decimals max).";

    setErrors(newErrors);
  }, [title, amount, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1" />
            Add
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="R0.00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              <div className="grid gap-2 flex-1">
                <Label htmlFor="category-selector">Category</Label>
                <Select defaultValue="outline">
                  <SelectTrigger id="category-selector">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="past-performance">Categories</SelectItem>
                    <SelectItem value="key-personnel">Spend History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
