// import "dotenv/config";
// import express, { Request, Response } from "express";
// import cors from "cors";
// import multer from "multer";
// import { connectMongo, collections } from "./mongo.js";
// import { extractAllThree } from "./openaiService.js";

// const app = express();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 200 * 1024 * 1024 },
// });

// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

// app.get("/api/health", (_req, res) => res.json({ ok: true }));

// app.post(
//   "/api/dashboards",
//   upload.array("pdfs", 10),
//   async (req: Request, res: Response) => {
//     try {
//       const userId = (req.header("x-user-id") || "").trim();
//       const dashboardName = (req.body.dashboardName || "").trim();
//       const files = req.files as Express.Multer.File[] | undefined;

//       if (!userId) return res.status(400).json({ error: "Missing userId" });
//       if (!dashboardName)
//         return res.status(400).json({ error: "Missing 'dashboardName'" });
//       if (!files?.length)
//         return res.status(400).json({ error: "No 'pdfs' files uploaded" });

//       const pdfInputs = files.map((f) => ({
//         filename: f.originalname || "statement.pdf",
//         buffer: f.buffer,
//       }));

//       const {
//         userMonthlyTransactionsData,
//         userMonthlyIncomeExpenseTransactionsData,
//         userMonthlyCategoryExpenditureData,
//         overviewData,
//       } = await extractAllThree(pdfInputs, userId);

//       const dashboardDoc = {
//         userId,
//         name: dashboardName,
//         overview: (overviewData ?? []).map((o) => ({
//           moneyIn: o.moneyIn,
//           moneyOut: o.moneyOut,
//           month: o.month,
//           startingBalance: o.startingBalance,
//         })),
//         userMonthlyTransactions: (userMonthlyTransactionsData ?? []).map(
//           (m) => ({
//             userId,
//             dashboardName,
//             month: m.month,
//             transactions: m.transactions,
//           })
//         ),
//         userMonthlyIncomeExpenseTransactions: (
//           userMonthlyIncomeExpenseTransactionsData ?? []
//         ).map((m) => ({
//           userId,
//           dashboardName,
//           month: m.month,
//           startingBalance: m.startingBalance,
//           transactions: m.transactions,
//         })),
//         userMonthlyCategoryExpenditure: (
//           userMonthlyCategoryExpenditureData ?? []
//         ).map((r) => ({
//           userId,
//           dashboardName,
//           month: r.month,
//           category: r.category,
//           totalSpend: r.totalSpend,
//         })),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const col = collections();
//       const result = await col.dashboards.insertOne(dashboardDoc);

//       res.json({
//         ok: true,
//         userId,
//         dashboardName,
//         dashboardId: result.insertedId,
//         counts: {
//           overview: dashboardDoc.overview.length,
//           userMonthlyTransactions: dashboardDoc.userMonthlyTransactions.length,
//           userMonthlyIncomeExpenseTransactions:
//             dashboardDoc.userMonthlyIncomeExpenseTransactions.length,
//           userMonthlyCategoryExpenditure:
//             dashboardDoc.userMonthlyCategoryExpenditure.length,
//         },
//       });
//     } catch (err: any) {
//       console.error(err);
//       res.status(500).json({ error: err?.message || "Failed" });
//     }
//   }
// );

// app.post(
//   "/api/dashboards/:dashboardName",
//   upload.array("pdfs", 10),
//   async (req: Request, res: Response) => {
//     try {
//       const userId = (req.header("x-user-id") || "").trim();
//       const dashboardName = req.params.dashboardName.trim();
//       // const dashboardName = (req.body.dashboardName || "").trim();
//       const files = req.files as Express.Multer.File[] | undefined;

//       if (!userId) return res.status(400).json({ error: "Missing userId" });
//       if (!dashboardName)
//         return res.status(400).json({ error: "Missing 'dashboardName'" });
//       if (!files?.length)
//         return res.status(400).json({ error: "No 'pdfs' files uploaded" });

//       const col = collections();
//       const existingDashboard = await col.dashboards.findOne({
//         userId,
//         name: dashboardName,
//       });

//       if (!existingDashboard)
//         return res
//           .status(404)
//           .json({ error: "Dashboard not found for this user." });

//       const pdfInputs = files.map((f) => ({
//         filename: f.originalname || "statement.pdf",
//         buffer: f.buffer,
//       }));

//       const dashboardId =
//         (existingDashboard as any)?._id?.toString?.() ??
//         (existingDashboard as any)?._id ??
//         null;

//       const {
//         userMonthlyTransactionsData,
//         userMonthlyIncomeExpenseTransactionsData,
//         userMonthlyCategoryExpenditureData,
//         overviewData,
//       } = await extractAllThree(pdfInputs, userId);

//       const overviewEntries = (overviewData ?? []).map((o) => ({
//         moneyIn: o.moneyIn,
//         moneyOut: o.moneyOut,
//         month: o.month,
//         startingBalance: o.startingBalance,
//       }));

//       const userMonthlyTransactions = (userMonthlyTransactionsData ?? []).map(
//         (m) => ({
//           userId,
//           dashboardName,
//           month: m.month,
//           transactions: m.transactions,
//         })
//       );

//       const userMonthlyIncomeExpenseTransactions = (
//         userMonthlyIncomeExpenseTransactionsData ?? []
//       ).map((m) => ({
//         userId,
//         dashboardName,
//         month: m.month,
//         startingBalance: m.startingBalance,
//         transactions: m.transactions,
//       }));

//       const userMonthlyCategoryExpenditure = (
//         userMonthlyCategoryExpenditureData ?? []
//       ).map((r) => ({
//         userId,
//         dashboardName,
//         month: r.month,
//         category: r.category,
//         totalSpend: r.totalSpend,
//       }));

//       const pushOps: Record<string, any> = {};
//       if (overviewEntries.length) pushOps.overview = { $each: overviewEntries };
//       if (userMonthlyTransactions.length)
//         pushOps.userMonthlyTransactions = { $each: userMonthlyTransactions };
//       if (userMonthlyIncomeExpenseTransactions.length)
//         pushOps.userMonthlyIncomeExpenseTransactions = {
//           $each: userMonthlyIncomeExpenseTransactions,
//         };
//       if (userMonthlyCategoryExpenditure.length)
//         pushOps.userMonthlyCategoryExpenditure = {
//           $each: userMonthlyCategoryExpenditure,
//         };

//       const updateDoc: Record<string, any> = {
//         $set: { updatedAt: new Date() },
//       };

//       if (Object.keys(pushOps).length > 0) {
//         updateDoc.$push = pushOps;
//       }

//       await col.dashboards.updateOne(
//         { userId, name: dashboardName },
//         updateDoc
//       );

//       res.json({
//         ok: true,
//         userId,
//         dashboardName,
//         dashboardId,
//         countsAdded: {
//           overview: overviewEntries.length,
//           userMonthlyTransactions: userMonthlyTransactions.length,
//           userMonthlyIncomeExpenseTransactions:
//             userMonthlyIncomeExpenseTransactions.length,
//           userMonthlyCategoryExpenditure: userMonthlyCategoryExpenditure.length,
//         },
//       });
//     } catch (err: any) {
//       console.error(err);
//       res.status(500).json({ error: err?.message || "Failed to update" });
//     }
//   }
// );

// const port = Number(process.env.PORT || 4010);
// (async () => {
//   await connectMongo(process.env.MONGODB_URI!, process.env.MONGODB_DB!);
//   app.listen(port, () => {
//     console.log(`Ingest API on http://localhost:${port}`);
//   });
// })();
/*======================================================================================================= */
// import "dotenv/config";
// import express, { Request, Response } from "express";
// import cors from "cors";
// import multer from "multer";
// import { connectMongo, collections } from "./db/mongo.js";
// import { extractAllThree } from "./services/openaiService.js";

// const app = express();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 200 * 1024 * 1024 },
// });

// app.use(cors({ origin: "*", credentials: true }));

// // Health Check
// app.get("/api/health", (_req, res) => res.json({ ok: true }));

// // POST /dashboards
// app.post(
//   "/api/dashboards",
//   upload.array("pdfs", 10),
//   async (req: Request, res: Response) => {
//     try {
//       const userId = (req.header("x-user-id") || "").trim();
//       const dashboardName = (req.body.dashboardName || "").trim();
//       const files = req.files as Express.Multer.File[] | undefined;

//       if (!userId) return res.status(400).json({ error: "Missing userId" });
//       if (!dashboardName)
//         return res.status(400).json({ error: "Missing 'dashboardName'" });
//       if (!files?.length)
//         return res.status(400).json({ error: "No 'pdfs' files uploaded" });

//       const pdfInputs = files.map((f) => ({
//         filename: f.originalname || "statement.pdf",
//         buffer: f.buffer,
//       }));

//       const {
//         userMonthlyTransactionsData,
//         userMonthlyIncomeExpenseTransactionsData,
//         userMonthlyCategoryExpenditureData,
//         overviewData,
//       } = await extractAllThree(pdfInputs, userId);

//       const dashboardDoc = {
//         userId,
//         name: dashboardName,
//         overview: (overviewData ?? []).map((o) => ({
//           moneyIn: o.moneyIn,
//           moneyOut: o.moneyOut,
//           month: o.month,
//           startingBalance: o.startingBalance,
//         })),
//         userMonthlyTransactions: (userMonthlyTransactionsData ?? []).map(
//           (m) => ({
//             userId,
//             dashboardName,
//             month: m.month,
//             transactions: m.transactions,
//           })
//         ),
//         userMonthlyIncomeExpenseTransactions: (
//           userMonthlyIncomeExpenseTransactionsData ?? []
//         ).map((m) => ({
//           userId,
//           dashboardName,
//           month: m.month,
//           startingBalance: m.startingBalance,
//           transactions: m.transactions,
//         })),
//         userMonthlyCategoryExpenditure: (
//           userMonthlyCategoryExpenditureData ?? []
//         ).map((r) => ({
//           userId,
//           dashboardName,
//           month: r.month,
//           category: r.category,
//           totalSpend: r.totalSpend,
//         })),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const col = collections();
//       const result = await col.dashboards.insertOne(dashboardDoc);

//       res.status(201).json({
//         ok: true,
//         userId,
//         dashboardName,
//         dashboardId: result.insertedId,
//         counts: {
//           overview: dashboardDoc.overview.length,
//           userMonthlyTransactions: dashboardDoc.userMonthlyTransactions.length,
//           userMonthlyIncomeExpenseTransactions:
//             dashboardDoc.userMonthlyIncomeExpenseTransactions.length,
//           userMonthlyCategoryExpenditure:
//             dashboardDoc.userMonthlyCategoryExpenditure.length,
//         },
//       });
//     } catch (err: any) {
//       console.error(err);
//       res.status(500).json({ error: err?.message || "Failed" });
//     }
//   }
// );

// //PUT /dashboards/:dashboardName
// app.put(
//   "/api/dashboards/:dashboardName",
//   upload.array("pdfs", 10),
//   async (req: Request, res: Response) => {
//     try {
//       const userId = (req.header("x-user-id") || "").trim();
//       const dashboardName = req.params.dashboardName.trim();
//       const files = req.files as Express.Multer.File[] | undefined;

//       if (!userId) return res.status(400).json({ error: "Missing userId" });
//       if (!dashboardName)
//         return res.status(400).json({ error: "Missing 'dashboardName'" });
//       if (!files?.length)
//         return res.status(400).json({ error: "No 'pdfs' files uploaded" });

//       const col = collections();
//       const existingDashboard = await col.dashboards.findOne({
//         userId,
//         name: dashboardName,
//       });

//       if (!existingDashboard)
//         return res
//           .status(404)
//           .json({ error: "Dashboard not found for this user." });

//       const pdfInputs = files.map((f) => ({
//         filename: f.originalname || "statement.pdf",
//         buffer: f.buffer,
//       }));

//       const dashboardId =
//         existingDashboard._id?.toString?.() ?? existingDashboard._id;

//       const {
//         userMonthlyTransactionsData,
//         userMonthlyIncomeExpenseTransactionsData,
//         userMonthlyCategoryExpenditureData,
//         overviewData,
//       } = await extractAllThree(pdfInputs, userId);

//       const overviewEntries = (overviewData ?? []).map((o) => ({
//         moneyIn: o.moneyIn,
//         moneyOut: o.moneyOut,
//         month: o.month,
//         startingBalance: o.startingBalance,
//       }));

//       const userMonthlyTransactions = (userMonthlyTransactionsData ?? []).map(
//         (m) => ({
//           userId,
//           dashboardName,
//           month: m.month,
//           transactions: m.transactions,
//         })
//       );

//       const userMonthlyIncomeExpenseTransactions = (
//         userMonthlyIncomeExpenseTransactionsData ?? []
//       ).map((m) => ({
//         userId,
//         dashboardName,
//         month: m.month,
//         startingBalance: m.startingBalance,
//         transactions: m.transactions,
//       }));

//       const userMonthlyCategoryExpenditure = (
//         userMonthlyCategoryExpenditureData ?? []
//       ).map((r) => ({
//         userId,
//         dashboardName,
//         month: r.month,
//         category: r.category,
//         totalSpend: r.totalSpend,
//       }));

//       const pushOps: Record<string, any> = {};
//       if (overviewEntries.length) pushOps.overview = { $each: overviewEntries };
//       if (userMonthlyTransactions.length)
//         pushOps.userMonthlyTransactions = { $each: userMonthlyTransactions };
//       if (userMonthlyIncomeExpenseTransactions.length)
//         pushOps.userMonthlyIncomeExpenseTransactions = {
//           $each: userMonthlyIncomeExpenseTransactions,
//         };
//       if (userMonthlyCategoryExpenditure.length)
//         pushOps.userMonthlyCategoryExpenditure = {
//           $each: userMonthlyCategoryExpenditure,
//         };

//       const updateDoc: Record<string, any> = {
//         $set: { updatedAt: new Date() },
//       };

//       if (Object.keys(pushOps).length > 0) {
//         updateDoc.$push = pushOps;
//       }

//       await col.dashboards.updateOne(
//         { userId, name: dashboardName },
//         updateDoc
//       );

//       res.json({
//         ok: true,
//         userId,
//         dashboardName,
//         dashboardId,
//         countsAdded: {
//           overview: overviewEntries.length,
//           userMonthlyTransactions: userMonthlyTransactions.length,
//           userMonthlyIncomeExpenseTransactions:
//             userMonthlyIncomeExpenseTransactions.length,
//           userMonthlyCategoryExpenditure: userMonthlyCategoryExpenditure.length,
//         },
//       });
//     } catch (err: any) {
//       console.error(err);
//       res.status(500).json({ error: err?.message || "Failed to update" });
//     }
//   }
// );

// const port = Number(process.env.PORT || 4010);
// (async () => {
//   await connectMongo(process.env.MONGODB_URI!, process.env.MONGODB_DB!);
//   app.listen(port, () => {
//     console.log(`Ingest API on http://localhost:${port}`);
//   });
// })();
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import { connectMongo } from "#db/mongo.js";

import logger from "#config/logger.js";
import dashboardRoutes from "#routes/dashboard.routes";

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  logger.info("AI Service is running");
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/dashboards", dashboardRoutes);
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not Found on AI Service" });
});

const port = Number(process.env.PORT || 4010);
(async () => {
  await connectMongo(process.env.MONGODB_URI!, process.env.MONGODB_DB!);
  app.listen(port, () => {
    logger.info(`AI Service is running on http://localhost:${port} `);
    console.log(`Ingest API on http://localhost:${port}`);
  });
})();
