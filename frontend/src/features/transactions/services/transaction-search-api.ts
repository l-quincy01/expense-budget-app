import type { FetchApi } from "@/lib/api";

export type TransactionSearchFilters = {
  query?: string;
  category?: string;
  from?: string;
  to?: string;
  minAmount?: string;
  maxAmount?: string;
  transactionType?: string;
  statementId?: string;
  dashboardName?: string;
};

export type TransactionSearchResult = {
  id: string;
  statementId: string;
  dashboardName: string;
  date: string;
  description: string;
  merchant?: string | null;
  category?: string | null;
  amount: number;
  transactionType?: string | null;
};

export type TransactionSearchResponse = {
  results: TransactionSearchResult[];
  total: number;
};

function buildQuery(filters: TransactionSearchFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const trimmed = value?.trim();
    if (trimmed) params.set(key, trimmed);
  });

  return params.toString();
}

export const transactionSearchApi = {
  search: (api: FetchApi, filters: TransactionSearchFilters) => {
    const query = buildQuery(filters);
    return api<TransactionSearchResponse>(
      `/api/transactions/search${query ? `?${query}` : ""}`
    );
  },
};
