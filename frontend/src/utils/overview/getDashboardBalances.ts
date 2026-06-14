import { Dashboard } from "@/types/types";

export function getOpeningBalance(
  userDashboard: Dashboard,
  targetMonth: string | undefined
) {
  if (!targetMonth) {
    return 0;
  }
  return (
    userDashboard?.userMonthlyIncomeExpenseTransactions?.find(
      (b) => b.month === targetMonth
    )?.startingBalance ?? 0
  );
}

export function getClosingBalance(
  userDashboard: Dashboard,
  targetMonth: string | undefined
) {
  if (!targetMonth) {
    return 0;
  }

  const block = userDashboard?.userMonthlyIncomeExpenseTransactions?.find(
    (b) => b.month === targetMonth
  );

  if (!block) return 0;

  const openingBalance = block.startingBalance ?? 0;

  return (block.transactions ?? []).reduce(
    (running, tx) => running + (tx.income || 0) - (tx.expense || 0),
    openingBalance
  );
}
