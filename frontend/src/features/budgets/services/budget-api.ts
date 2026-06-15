import type { Budget, Category } from "@/types/types";
import type { FetchApi } from "@/lib/api";

export type CreateBudgetInput = {
  dashboardName: string;
  category: Category;
  budgetAmount: number;
  spentAmount: number;
};

export type UpdateBudgetInput = CreateBudgetInput;

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
