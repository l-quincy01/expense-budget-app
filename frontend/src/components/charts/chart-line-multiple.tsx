"use client";

import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  MessageCircle,
  Scale,
  TrendingUp,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple line chart";

// 🔹 Add a config entry for Balance so ChartContainer creates --color-balance
const chartConfig = {
  desktop: {
    label: "Income",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Expense",
    color: "var(--chart-2)",
  },
  balance: {
    label: "Balance",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

// Your existing data (unchanged)
export const rawData2 = [
  {
    month: "September",
    transactions: [
      { day: "30", income: 0, expense: 59.5 }, // Vida E Cafe
      { day: "30", income: 9782.33, expense: 0 }, // Salary
      { day: "30", income: 0, expense: 135.0 }, // Telkom
      { day: "30", income: 0, expense: 0.0 }, // Interest rate record
    ],
  },
  {
    month: "October",
    transactions: [
      { day: "01", income: 0, expense: 53.0 }, // Eat Fresh
      { day: "01", income: 0, expense: 74.0 }, // Eat Fresh
      { day: "01", income: 0, expense: 112.0 }, // Eat Fresh
      { day: "01", income: 0, expense: 400.0 }, // Gautrain
      { day: "01", income: 0, expense: 410.41 }, // ChatGPT Sub
      { day: "01", income: 0, expense: 2.0 }, // EFT Fee
      { day: "02", income: 0, expense: 250.0 }, // Payment to Bro Lesego
      { day: "02", income: 0, expense: 1557.86 }, // Takealot
      { day: "04", income: 0, expense: 515.87 }, // Log2Base2
      { day: "04", income: 0, expense: 1.99 }, // Byc Debit
      { day: "07", income: 1569.0, expense: 0 }, // Credit Voucher Takealot
      { day: "07", income: 0, expense: 379.0 }, // Nando’s
      { day: "07", income: 0, expense: 467.91 }, // Checkers Sixty60
      { day: "07", income: 0, expense: 529.0 }, // Takealot
      { day: "07", income: 0, expense: 7000.0 }, // Investment Save
      { day: "07", income: 0, expense: 0.0 }, // Interest rate record
      { day: "10", income: 0, expense: 159.3 }, // KFC
      { day: "10", income: 0, expense: 115.71 }, // Microsoft
      { day: "11", income: 9.72, expense: 0 }, // Credit Interest
      { day: "11", income: 9.72, expense: 0 }, // Credit Int Paid To
      { day: "11", income: 0, expense: 73.5 }, // Monthly Account Fee
      { day: "11", income: 0, expense: 0.55 }, // Service Fee
      { day: "11", income: 0, expense: 1.21 }, // Byc Debit
    ],
  },
];

// 🔹 Month order map so we can sort chronologically
const MONTH_INDEX: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

// 🔹 Set this to the balance BEFORE your first transaction
const STARTING_BALANCE = 4347.7; // = 4288.20 (shown after -59.50) + 59.50

// 🔹 Flatten, sort chronologically, and compute running balance
const chartData = (() => {
  // flatten
  const flat = rawData2.flatMap((m) =>
    m.transactions.map((t) => ({
      month: m.month,
      day: t.day,
      income: t.income,
      expense: t.expense,
    }))
  );

  // sort by (month, day)
  flat.sort((a, b) => {
    const ma = MONTH_INDEX[a.month] ?? 0;
    const mb = MONTH_INDEX[b.month] ?? 0;
    if (ma !== mb) return ma - mb;
    return Number(a.day) - Number(b.day);
  });

  // compute running balance
  let running = STARTING_BALANCE;
  return flat.map((row) => {
    running = running + (row.income || 0) - (row.expense || 0);
    return {
      ...row,
      balance: Number(running.toFixed(2)),
      // optional: nice x-label like "Sep 30"
      label: `${row.month.slice(0, 3)} ${row.day}`,
    };
  });
})();

export function ChartLineMultiple() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expense vs Balance</CardTitle>
        <CardDescription>Statement snapshot</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              // You can switch between "month" or "label"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            {/* Income */}
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
              name="Income"
            />

            {/* Expense */}
            <Line
              dataKey="expense"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
              name="Expense"
            />

            {/* 🔹 Balance */}
            <Line
              dataKey="balance"
              type="monotone"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={false}
              name="Balance"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      {/* <CardFooter>
        <div className="flex w-full items-center gap-2 text-sm">
          <div className="grid gap-2">
            {(() => {
              const totalIncome = chartData.reduce(
                (sum, t) => sum + t.income,
                0
              );
              const totalExpense = chartData.reduce(
                (sum, t) => sum + t.expense,
                0
              );
              const finalBalance = chartData.at(-1)?.balance ?? 0;
              const net = totalIncome - totalExpense;

              const insight =
                net > 0
                  ? "You’re spending less than you earn — good job!"
                  : "Your expenses are higher than your income — watch your spending.";

              return (
                <div className="flex flex-col justify-start text-muted-foreground leading-none">
                  <div className="gap-2 inline-flex items-center">
                    <BanknoteArrowUp /> Income R{totalIncome.toFixed(2)}
                  </div>

                  <div className="inline-flex items-center">
                    <BanknoteArrowDown /> Expense R{totalExpense.toFixed(2)} |
                  </div>
                  <div className="inline-flex items-center">
                    <Scale /> Balance R{finalBalance.toFixed(2)}{" "}
                  </div>

                  <div className="inline-flex items-center">
                    <MessageCircle /> {insight}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </CardFooter> */}
    </Card>
  );
}
