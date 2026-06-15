import type {
  Budget,
  Category,
  Dashboard,
  Profile,
  userMonthlyCategoryExpenditure,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyTransactions,
} from "@/types/types";
import type { FetchApi } from "./api";

export type IngestResult = {
  userId: string;
  month: string;
  transactionsInserted: number;
  incomeExpensesInserted: number;
  categoryRowsInserted: number;
};

export type IngestResponse =
  | IngestResult
  | {
      nodeResponse?: IngestResult;
      transactionsInserted?: number;
    };

export function getIngestTransactionsInserted(response: IngestResponse) {
  if ("nodeResponse" in response && response.nodeResponse) {
    return response.nodeResponse.transactionsInserted;
  }

  return response.transactionsInserted;
}

export type CreateBudgetInput = {
  dashboardName: string;
  category: Category;
  budgetAmount: number;
  spentAmount: number;
};

export type UpdateBudgetInput = CreateBudgetInput;

function buildStatementForm(dashboardName: string, files: File[]) {
  const form = new FormData();
  form.append("dashboardName", dashboardName);
  files.forEach((file) => {
    form.append("pdfs", file, file.name);
  });
  return form;
}

export const dashboardApi = {
  listNames: (api: FetchApi) => api<string[]>("/api/dashboards/names"),

  get: (api: FetchApi, dashboardName: string) =>
    api<Dashboard>(`/api/dashboards/${encodeURIComponent(dashboardName)}`),

  create: (api: FetchApi, dashboardName: string, files: File[]) =>
    api<IngestResponse>("/api/dashboards", {
      method: "POST",
      body: buildStatementForm(dashboardName, files),
    }),

  uploadStatement: (api: FetchApi, dashboardName: string, files: File[]) =>
    api<IngestResponse>(`/api/dashboards/${encodeURIComponent(dashboardName)}`, {
      method: "PATCH",
      body: buildStatementForm(dashboardName, files),
    }),

  delete: (api: FetchApi, dashboardName: string) =>
    api<void>(`/api/dashboards/${encodeURIComponent(dashboardName)}`, {
      method: "DELETE",
    }),
};

export const budgetApi = {
  list: (api: FetchApi, dashboardName?: string) => {
    const query = dashboardName
      ? `?dashboardName=${encodeURIComponent(dashboardName)}`
      : "";
    return api<Budget[]>(`/api/budgets${query}`);
  },

  create: (api: FetchApi, payload: CreateBudgetInput) =>
    api<Budget>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (api: FetchApi, budgetId: string, payload: UpdateBudgetInput) =>
    api<void>(`/api/budgets/${budgetId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (api: FetchApi, budgetId: string) =>
    api<void>(`/api/budgets/${budgetId}`, {
      method: "DELETE",
    }),
};

export const profileApi = {
  get: (api: FetchApi) => api<Profile>("/api/profile"),
};

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
