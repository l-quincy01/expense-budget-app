import type { FetchApi } from "@/lib/api";
import type {
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "@/types/types";

export const userDataApi = {
  allTransactions: (api: FetchApi) =>
    api<userMonthlyTransactions[]>("/api/data/all/transactions"),

  allIncomeExpense: (api: FetchApi) =>
    api<userMonthlyIncomeExpenseTransactions[]>(
      "/api/data/all/income-expense"
    ),

  allCategories: (api: FetchApi) =>
    api<userMonthlyCategoryExpenditure[]>("/api/data/all/categories"),

  transactions: (api: FetchApi, dashboardName: string) =>
    api<userMonthlyTransactions>(
      `/api/data/transactions?dashboardName=${encodeURIComponent(
        dashboardName
      )}`
    ),

  incomeExpense: (api: FetchApi, dashboardName: string) =>
    api<userMonthlyIncomeExpenseTransactions>(
      `/api/data/income-expense?dashboardName=${encodeURIComponent(
        dashboardName
      )}`
    ),

  categories: (api: FetchApi, dashboardName: string) =>
    api<userMonthlyCategoryExpenditure[]>(
      `/api/data/categories?dashboardName=${encodeURIComponent(dashboardName)}`
    ),
};
