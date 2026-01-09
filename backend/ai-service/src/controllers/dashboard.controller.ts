import { Request, Response } from "express";
import { extractAllThree } from "#services/openaiService";
import { collections } from "#db/mongo";
import logger from "#config/logger";

export const createDashboard = async (req: Request, res: Response) => {
  try {
    logger.info("Creating Dashboard...");
    logger.info("[createDashboard] Incoming request");

    const userId = (req.header("x-user-id") || "").trim();
    const dashboardName = (req.body.dashboardName || "").trim();
    const files = req.files as Express.Multer.File[] | undefined;

    logger.info(`[createDashboard] userId: ${userId}`);
    logger.info(`[createDashboard] dashboardName: ${dashboardName}`);
    logger.info(`[createDashboard] uploaded file count: ${files?.length || 0}`);

    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!dashboardName)
      return res.status(400).json({ error: "Missing 'dashboardName'" });
    if (!files?.length)
      return res.status(400).json({ error: "No 'pdfs' files uploaded" });

    const pdfInputs = files.map((f) => {
      logger.info(
        `[createDashboard] Preparing PDF buffer for ${f.originalname}`
      );

      return {
        filename: f.originalname || "statement.pdf",
        buffer: f.buffer,
      };
    });

    logger.info(
      "[createDashboard] Calling extractAllThree()",
      "\n",
      "=========================="
    );
    const {
      userMonthlyTransactionsData,
      userMonthlyIncomeExpenseTransactionsData,
      userMonthlyCategoryExpenditureData,
      overviewData,
    } = await extractAllThree(pdfInputs, userId);

    logger.info(
      `[createDashboard] extractAllThree results -> overview: ${
        overviewData?.length || 0
      }, monthlyTransactions: ${
        userMonthlyTransactionsData?.length || 0
      }, incomeExpense: ${
        userMonthlyIncomeExpenseTransactionsData?.length || 0
      }, categoryExpenditure: ${
        userMonthlyCategoryExpenditureData?.length || 0
      }`
    );
    logger.info("\n", "==========================");

    logger.info("[createDashboard] Constructing dashboard document");
    const dashboardDoc = {
      userId,
      name: dashboardName,
      overview: (overviewData ?? []).map((o) => ({
        moneyIn: o.moneyIn,
        moneyOut: o.moneyOut,
        month: o.month,
        startingBalance: o.startingBalance,
      })),
      userMonthlyTransactions: (userMonthlyTransactionsData ?? []).map((m) => ({
        userId,
        dashboardName,
        month: m.month,
        transactions: m.transactions,
      })),
      userMonthlyIncomeExpenseTransactions: (
        userMonthlyIncomeExpenseTransactionsData ?? []
      ).map((m) => ({
        userId,
        dashboardName,
        month: m.month,
        startingBalance: m.startingBalance,
        transactions: m.transactions,
      })),
      userMonthlyCategoryExpenditure: (
        userMonthlyCategoryExpenditureData ?? []
      ).map((r) => ({
        userId,
        dashboardName,
        month: r.month,
        category: r.category,
        totalSpend: r.totalSpend,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info("[createDashboard] Inserting dashboard into MongoDB");
    const col = collections();
    const result = await col.dashboards.insertOne(dashboardDoc);

    res.status(201).json({
      ok: true,
      userId,
      dashboardName,
      dashboardId: result.insertedId,
      counts: {
        overview: dashboardDoc.overview.length,
        userMonthlyTransactions: dashboardDoc.userMonthlyTransactions.length,
        userMonthlyIncomeExpenseTransactions:
          dashboardDoc.userMonthlyIncomeExpenseTransactions.length,
        userMonthlyCategoryExpenditure:
          dashboardDoc.userMonthlyCategoryExpenditure.length,
      },
    });
    logger.info(
      `[createDashboard] Dashboard created successfully. insertedId: ${result.insertedId}`
    );
  } catch (err: any) {
    logger.error("[createDashboard] Error occurred", err);
    // console.error(err);
    res.status(500).json({ error: err?.message || "Failed" });
  }
};

export const updateDashboard = async (req: Request, res: Response) => {
  try {
    logger.info("Updating Dashboard...");
    logger.info("[updateDashboard] Incoming request");

    const userId = (req.header("x-user-id") || "").trim();
    const dashboardName = req.params.dashboardName.trim();
    const files = req.files as Express.Multer.File[] | undefined;

    logger.info("[updateDashboard] Incoming request");
    logger.info(`[updateDashboard] userId: ${userId}`);
    logger.info(`[updateDashboard] dashboardName: ${dashboardName}`);
    logger.info(`[updateDashboard] uploaded file count: ${files?.length || 0}`);

    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!dashboardName)
      return res.status(400).json({ error: "Missing 'dashboardName'" });
    if (!files?.length)
      return res.status(400).json({ error: "No 'pdfs' files uploaded" });

    logger.info("[updateDashboard] Searching for existing dashboard");

    const col = collections();
    const existingDashboard = await col.dashboards.findOne({
      userId,
      name: dashboardName,
    });

    if (existingDashboard) {
      logger.info(
        `[updateDashboard] Dashboard found. dashboardId: ${existingDashboard?._id?.toString()}`
      );
    } else if (!existingDashboard) {
      logger.info(
        `[updateDashboard] Dashboard not found  for dashboardId: ${existingDashboard?._id?.toString()}`
      );
      return res
        .status(404)
        .json({ error: "Dashboard not found for this user." });
    }

    const pdfInputs = files.map((f) => {
      logger.info(
        `[updateDashboard] Preparing PDF input for: ${f.originalname}`
      );
      return {
        filename: f.originalname || "statement.pdf",
        buffer: f.buffer,
      };
    });

    const dashboardId =
      existingDashboard._id?.toString?.() ?? existingDashboard._id;

    logger.info("[updateDashboard] Calling extractAllThree");
    const {
      userMonthlyTransactionsData,
      userMonthlyIncomeExpenseTransactionsData,
      userMonthlyCategoryExpenditureData,
      overviewData,
    } = await extractAllThree(pdfInputs, userId);

    logger.info(
      `[updateDashboard] extractAllThree results -> overview: ${
        overviewData?.length || 0
      }, monthlyTransactions: ${
        userMonthlyTransactionsData?.length || 0
      }, incomeExpense: ${
        userMonthlyIncomeExpenseTransactionsData?.length || 0
      }, categoryExpenditure: ${
        userMonthlyCategoryExpenditureData?.length || 0
      }`
    );
    logger.info("\n", "==========================");

    const overviewEntries = (overviewData ?? []).map((o) => ({
      moneyIn: o.moneyIn,
      moneyOut: o.moneyOut,
      month: o.month,
      startingBalance: o.startingBalance,
    }));

    const userMonthlyTransactions = (userMonthlyTransactionsData ?? []).map(
      (m) => ({
        userId,
        dashboardName,
        month: m.month,
        transactions: m.transactions,
      })
    );

    const userMonthlyIncomeExpenseTransactions = (
      userMonthlyIncomeExpenseTransactionsData ?? []
    ).map((m) => ({
      userId,
      dashboardName,
      month: m.month,
      startingBalance: m.startingBalance,
      transactions: m.transactions,
    }));

    const userMonthlyCategoryExpenditure = (
      userMonthlyCategoryExpenditureData ?? []
    ).map((r) => ({
      userId,
      dashboardName,
      month: r.month,
      category: r.category,
      totalSpend: r.totalSpend,
    }));

    logger.info("[updateDashboard] Building update document");
    const pushOps: Record<string, any> = {};
    if (overviewEntries.length) pushOps.overview = { $each: overviewEntries };
    if (userMonthlyTransactions.length)
      pushOps.userMonthlyTransactions = { $each: userMonthlyTransactions };
    if (userMonthlyIncomeExpenseTransactions.length)
      pushOps.userMonthlyIncomeExpenseTransactions = {
        $each: userMonthlyIncomeExpenseTransactions,
      };
    if (userMonthlyCategoryExpenditure.length)
      pushOps.userMonthlyCategoryExpenditure = {
        $each: userMonthlyCategoryExpenditure,
      };

    const updateDoc: Record<string, any> = {
      $set: { updatedAt: new Date() },
    };

    if (Object.keys(pushOps).length > 0) {
      updateDoc.$push = pushOps;
    }

    logger.info("[updateDashboard] Executing MongoDB updateOne operation");
    await col.dashboards.updateOne({ userId, name: dashboardName }, updateDoc);

    res.json({
      ok: true,
      userId,
      dashboardName,
      dashboardId,
      countsAdded: {
        overview: overviewEntries.length,
        userMonthlyTransactions: userMonthlyTransactions.length,
        userMonthlyIncomeExpenseTransactions:
          userMonthlyIncomeExpenseTransactions.length,
        userMonthlyCategoryExpenditure: userMonthlyCategoryExpenditure.length,
      },
    });
    logger.info("[updateDashboard] Dashboard update completed successfully");
  } catch (err: any) {
    logger.error("[updateDashboard] Error occurred", err);
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to update" });
  }
};
