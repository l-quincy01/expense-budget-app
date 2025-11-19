import {
  categories,
  userMonthlyIncomeExpenseTransactions,
} from "@/types/types";

// export interface barChartExpenseTotals {
//   month: string;
//   expenseTotal: number;
// }

// export interface barChartIncomeTotals {
//   month: string;
//   incomeTotal: number;
// }

// export function sumExpenses(
//   data: UserMonthlyIncomeExpenseTransactions[]
// ): barChartExpenseTotals[] {
//   return data.map((item) => {
//     const total = item.transactions.reduce(
//       (acc, tx) => acc + (tx.expense ?? 0),
//       0
//     );

//     return {
//       month: item.month,
//       expenseTotal: total,
//     };
//   });
// }
// export function sumIncome(
//   data: UserMonthlyIncomeExpenseTransactions[]
// ): barChartIncomeTotals[] {
//   return data.map((item) => {
//     const total = item.transactions.reduce(
//       (acc, tx) => acc + (tx.income ?? 0),
//       0
//     );

//     return {
//       month: item.month,
//       incomeTotal: total,
//     };
//   });
// }

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
