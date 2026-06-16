import { Request, Response } from "express";
import logger from "#config/logger";
import { generateStatementDataUseCase } from "#services/llmUseCase.service";
import { parseExtractStatementRequest } from "#validators/statement.validator";

export const extractStatement = async (req: Request, res: Response) => {
  logger.info("[extractStatement] Incoming request");

  try {
    const input = parseExtractStatementRequest(req);
    const result = await generateStatementDataUseCase(input.pdfs, input.userId);

    logger.info("[extractStatement] Statement extracted", {
      userId: input.userId,
      pdfCount: input.pdfs.length,
    });

    return res.json(result);
  } catch (err: any) {
    logger.error("[extractStatement] Failed", err);
    return res.status(err.statusCode ?? 500).json({
      error: err.message ?? "Failed to extract statement",
    });
  }
};
