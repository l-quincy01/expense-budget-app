import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from "lucide-react";

export default function Headline() {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 justify-start">
        <div className="text-4xl font-bold">Hi Tebogo</div>
        <div className="text-lg text-muted-foreground">
          Here&apos;s what&apos;s happening with your money. Let&apos;s manage
          your expense.
        </div>
      </div>

      {/*Main Overview*/}
      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 gap-4 w-fit">
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Money Out</p>
              <p className="font-bold text-2xl">R14,999.00</p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <BanknoteArrowDown size={28} />
            </div>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Money In</p>
              <p className="font-bold text-2xl">R14,999.00</p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <BanknoteArrowUp size={28} />
            </div>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardContent className="flex flex-row gap-8 items-center justify-between w-fit ">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Budget Set</p>
              <p className="font-bold text-2xl">R14,999.00</p>
            </div>
            <div className="p-4 rounded-full bg-accent">
              <Wallet size={28} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
