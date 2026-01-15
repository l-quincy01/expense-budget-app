import { userMonthlyIncomeExpenseTransactions } from "@/types/types";

export const sortedMonthlyTransactions = (
  monthlyIncomeExpenseTransactions: userMonthlyIncomeExpenseTransactions[]
) => {
  return monthlyIncomeExpenseTransactions.map((block) => ({
    month: block.month,
    startingBalance: block.startingBalance,
    transactions: [...(block.transactions ?? [])].sort(
      (a, b) => Number(a.day) - Number(b.day)
    ),
  }));
};
