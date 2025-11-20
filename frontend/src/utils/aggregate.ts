/* eslint-disable @typescript-eslint/no-explicit-any */
export function combineByMonth(data: any[]) {
  const monthMap: {
    [month: string]: {
      month: string;
      startingBalance: number;
      transactions: { day: string; income: number; expense: number }[];
      _earliestStartDay: number;
    };
  } = {};

  // Helper: find earliest transaction day in an entry
  function getEarliestDay(transactions: { day: string }[]): number {
    return Math.min(...transactions.map((t) => Number(t.day)));
  }

  data.forEach((entry) => {
    const { month, startingBalance, transactions } = entry;
    const earliestDay = getEarliestDay(transactions);

    if (!monthMap[month]) {
      // First time we see this month
      monthMap[month] = {
        month,
        startingBalance,
        transactions: [...transactions],
        _earliestStartDay: earliestDay, // internal helper field
      };
    } else {
      const existing = monthMap[month];

      // Merge transactions
      existing.transactions.push(...transactions);

      // If this entry starts earlier in the month, update startingBalance
      if (earliestDay < existing._earliestStartDay) {
        existing.startingBalance = startingBalance;
        existing._earliestStartDay = earliestDay;
      }
    }
  });

  // Build result without Object.values
  const result: {
    month: string;
    startingBalance: number;
    transactions: { day: string; income: number; expense: number }[];
  }[] = [];

  for (const month in monthMap) {
    if (Object.prototype.hasOwnProperty.call(monthMap, month)) {
      const monthObj = monthMap[month];

      // Sort transactions by day
      monthObj.transactions.sort((a, b) => Number(a.day) - Number(b.day));

      // Push a clean object (without _earliestStartDay)
      result.push({
        month: monthObj.month,
        startingBalance: monthObj.startingBalance,
        transactions: monthObj.transactions,
      });
    }
  }

  return result;
}
