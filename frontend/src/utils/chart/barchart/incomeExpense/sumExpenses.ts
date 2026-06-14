import { userMonthlyIncomeExpenseTransactions } from "@/types/types";

export interface MonthlyIncomeExpenseTotals {
  month: string;
  expenseTotal: number;
  incomeTotal: number;
}

export function sumIncomeAndExpenses(
  data: userMonthlyIncomeExpenseTransactions[]
): MonthlyIncomeExpenseTotals[] {
  return data.map((item) => {
    const { incomeTotal, expenseTotal } = item.transactions.reduce(
      (acc, tx) => {
        acc.incomeTotal += tx.income ?? 0;
        acc.expenseTotal += tx.expense ?? 0;
        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0 }
    );

    return {
      month: item.month,
      incomeTotal,
      expenseTotal,
    };
  });
}
