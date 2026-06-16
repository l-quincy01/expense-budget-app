import { Request } from "express";

export function parseExtractStatementRequest(req: Request) {
  const userId = req.header("x-user-id")?.trim();
  const files = req.files as Express.Multer.File[] | undefined;

  if (!userId) throw badRequest("Missing userId");
  if (!files?.length) throw badRequest("No PDF files uploaded");

  return {
    userId,
    pdfs: files.map((f) => ({
      filename: f.originalname ?? "statement.pdf",
      buffer: f.buffer,
    })),
  };
}

function badRequest(message: string) {
  const err: any = new Error(message);
  err.statusCode = 400;
  return err;
}
