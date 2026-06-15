import { userMonthlyIncomeExpenseTransactions } from "@/types/types";

export function mergeMonthlyTransactionsWithStartingBalance(
  data: userMonthlyIncomeExpenseTransactions[]
) {
  const monthMap: {
    [month: string]: {
      month: string;
      startingBalance: number;
      transactions: { day: string; income: number; expense: number }[];
      _earliestStartDay: number;
    };
  } = {};

  function getEarliestDay(transactions: { day: string }[]): number {
    return Math.min(...transactions.map((t) => Number(t.day)));
  }

  data.forEach((entry) => {
    const { month, startingBalance, transactions } = entry;
    const earliestDay = getEarliestDay(transactions);

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        startingBalance,
        transactions: [...transactions],
        _earliestStartDay: earliestDay,
      };
    } else {
      const existing = monthMap[month];

      existing.transactions.push(...transactions);

      if (earliestDay < existing._earliestStartDay) {
        existing.startingBalance = startingBalance;
        existing._earliestStartDay = earliestDay;
      }
    }
  });

  const result: {
    month: string;
    startingBalance: number;
    transactions: { day: string; income: number; expense: number }[];
  }[] = [];

  for (const month in monthMap) {
    if (Object.prototype.hasOwnProperty.call(monthMap, month)) {
      const monthObj = monthMap[month];

      monthObj.transactions.sort((a, b) => Number(a.day) - Number(b.day));

      result.push({
        month: monthObj.month,
        startingBalance: monthObj.startingBalance,
        transactions: monthObj.transactions,
      });
    }
  }

  return result;
}
