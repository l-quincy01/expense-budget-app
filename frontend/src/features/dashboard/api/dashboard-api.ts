import type { Dashboard } from "@/types/types";
import type { FetchApi } from "@/lib/api";

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
