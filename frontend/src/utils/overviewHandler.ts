/* eslint-disable @typescript-eslint/no-explicit-any */
export interface userMonthlyIncomeExpenseTransactions {
  month: string;
  startingBalance: number;
  transactions: { day: string; income: number; expense: number }[];
}

export interface monthlyTotals {
  moneyIn: number;
  moneyOut: number;
  month: string;
}

export function calculateMonthlyTotals(
  data: userMonthlyIncomeExpenseTransactions[]
): monthlyTotals[] {
  const monthlyMap = new Map<string, { moneyIn: number; moneyOut: number }>();

  data.forEach((monthData) => {
    const month = monthData.month;

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { moneyIn: 0, moneyOut: 0 });
    }

    const totals = monthlyMap.get(month)!;

    monthData.transactions.forEach((transaction) => {
      totals.moneyIn += extractNumber(transaction.income);
      totals.moneyOut += extractNumber(transaction.expense);
    });
  });

  return Array.from(monthlyMap.entries()).map(([month, totals]) => ({
    moneyIn: Number(totals.moneyIn.toFixed(2)),
    moneyOut: Number(totals.moneyOut.toFixed(2)),
    month,
  }));
}

function extractNumber(value: any): number {
  if (typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object") {
    if (value.$numberInt) {
      return parseInt(value.$numberInt, 10);
    }
    if (value.$numberDouble) {
      return parseFloat(value.$numberDouble);
    }
  }

  return 0;
}
