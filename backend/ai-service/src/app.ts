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
