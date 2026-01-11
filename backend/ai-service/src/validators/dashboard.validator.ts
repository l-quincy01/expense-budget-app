import { Request } from "express";

export function parseCreateDashboardRequest(req: Request, isUpdate = false) {
  const userId = req.header("x-user-id")?.trim();
  const dashboardName = (
    isUpdate ? req.params.dashboardName : req.body.dashboardName
  )?.trim();

  const files = req.files as Express.Multer.File[] | undefined;

  if (!userId) throw badRequest("Missing userId");
  if (!dashboardName) throw badRequest("Missing dashboardName");
  if (!files?.length) throw badRequest("No PDF files uploaded");

  return {
    userId,
    dashboardName: decodeURIComponent(dashboardName),
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
