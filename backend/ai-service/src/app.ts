import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { connectMongo, collections } from "./mongo.js";
import { extractAllThree } from "./openaiService.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post(
  "/api/ingest",
  upload.array("pdfs", 10),
  async (req: Request, res: Response) => {
    try {
      const userId = (req.header("x-user-id") || "").trim();
      const dashboardName = (req.body.dashboardName || "").trim();
      const files = req.files as Express.Multer.File[] | undefined;

      if (!userId) return res.status(400).json({ error: "Missing userId" });
      if (!dashboardName)
        return res.status(400).json({ error: "Missing 'dashboardName'" });
      if (!files?.length)
        return res.status(400).json({ error: "No 'pdfs' files uploaded" });

      const pdfInputs = files.map((f) => ({
        filename: f.originalname || "statement.pdf",
        buffer: f.buffer,
      }));

      const {
        userMonthlyTransactionsData,
        userMonthlyIncomeExpenseTransactionsData,
        userMonthlyCategoryExpenditureData,
        overviewData,
      } = await extractAllThree(pdfInputs, userId);

      const dashboardDoc = {
        userId,
        name: dashboardName,
        overview: (overviewData ?? []).map((o) => ({
          moneyIn: o.moneyIn,
          moneyOut: o.moneyOut,
          month: o.month,
          startingBalance: o.startingBalance,
        })),
        userMonthlyTransactions: (userMonthlyTransactionsData ?? []).map(
          (m) => ({
            userId,
            dashboardName,
            month: m.month,
            transactions: m.transactions,
          })
        ),
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

      const col = collections();
      const result = await col.dashboards.insertOne(dashboardDoc);

      res.json({
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
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err?.message || "Failed" });
    }
  }
);

// app.post("/update-dashboard" async(req: Request, res: Response) => {

// })
const port = Number(process.env.PORT || 4010);
(async () => {
  await connectMongo(process.env.MONGODB_URI!, process.env.MONGODB_DB!);
  app.listen(port, () => {
    console.log(`Ingest API on http://localhost:${port}`);
  });
})();
