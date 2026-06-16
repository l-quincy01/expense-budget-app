import { extractStatement } from "#controllers/statement.controller";
import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post("/extract", upload.array("pdfs", 10), extractStatement);

export default router;
