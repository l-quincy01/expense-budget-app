import {
  createDashboard,
  updateDashboard,
} from "#controllers/dashboard.controller";
import { Router } from "express";
import express, { Request, Response } from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post("/", upload.array("pdfs", 10), createDashboard);

router.put("/:dashboardName", upload.array("pdfs", 10), updateDashboard);

export default router;
