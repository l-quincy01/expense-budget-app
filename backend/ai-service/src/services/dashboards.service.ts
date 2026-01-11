import { extractAllThree } from "#services/openaiService";
import { collections } from "#db/mongo";
import logger from "#config/logger";

import {
  buildDashboardDocument,
  buildDashboardUpdate,
} from "src/mappers/dashboard.mapper";

export async function createDashboard(input: {
  userId: string;
  dashboardName: string;
  pdfs: { filename: string; buffer: Buffer }[];
}) {
  logger.info("[DashboardService] Creating dashboard", {
    userId: input.userId,
    dashboardName: input.dashboardName,
    pdfCount: input.pdfs.length,
  });

  const extracted = await extractAllThree(input.pdfs, input.userId);

  const dashboardDoc = buildDashboardDocument(
    input.userId,
    input.dashboardName,
    extracted
  );

  const col = collections();
  const result = await col.dashboards.insertOne(dashboardDoc);

  return {
    ok: true,
    dashboardId: result.insertedId,
    dashboardName: input.dashboardName,
    counts: {
      overview: dashboardDoc.overview.length,
      transactions: dashboardDoc.userMonthlyTransactions.length,
      incomeExpense: dashboardDoc.userMonthlyIncomeExpenseTransactions.length,
      categories: dashboardDoc.userMonthlyCategoryExpenditure.length,
    },
  };
}

export async function updateDashboard(input: {
  userId: string;
  dashboardName: string;
  pdfs: { filename: string; buffer: Buffer }[];
}) {
  const col = collections();

  const existing = await col.dashboards.findOne({
    userId: input.userId,
    name: input.dashboardName,
  });

  if (!existing) {
    const err: any = new Error("Dashboard not found");
    err.statusCode = 404;
    throw err;
  }

  const extracted = await extractAllThree(input.pdfs, input.userId);

  const update = buildDashboardUpdate(
    input.userId,
    input.dashboardName,
    extracted
  );

  if (!update.$push) {
    return {
      ok: true,
      dashboardId: existing._id,
      patched: false,
    };
  }

  await col.dashboards.updateOne({ _id: existing._id }, update);

  return {
    ok: true,
    dashboardId: existing._id,
    patched: true,
  };
}
