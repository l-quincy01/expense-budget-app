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

export default function AddBudgetDialog() {
  const [category, setCategory] = useState("GeneralRetail");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      category,
      amount,
    });
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon">
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="flex w-full" id="category" size="sm">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent id="view-selector-content">
                  <SelectItem value="GeneralRetail">General Retail</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="EatingOutAndTreats">
                    Eating Out & Treats
                  </SelectItem>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="ProfessionalServices">
                    Professional Services
                  </SelectItem>
                  <SelectItem value="CarUseAndServices">
                    Car Use & Services
                  </SelectItem>
                  <SelectItem value="DonationsAndGiving">
                    Donations & Giving
                  </SelectItem>
                  <SelectItem value="GiftsAndFlowers">
                    Gifts & Flowers
                  </SelectItem>
                  <SelectItem value="Hobbies">Hobbies</SelectItem>
                  <SelectItem value="HomewareAndAppliances">
                    Homeware & Appliances
                  </SelectItem>
                  <SelectItem value="MusicGamingApps">
                    Music, Gaming & Apps
                  </SelectItem>
                  <SelectItem value="OutdoorAndAdventure">
                    Outdoor & Adventure
                  </SelectItem>
                  <SelectItem value="PharmaciesAndWellbeing">
                    Pharmacies & Wellbeing
                  </SelectItem>
                  <SelectItem value="TravelAndHolidays">
                    Travel & Holidays
                  </SelectItem>
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
