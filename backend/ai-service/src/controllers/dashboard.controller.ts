import { Request, Response } from "express";
import logger from "#config/logger";
import * as DashboardService from "#services/dashboards.service";
import { parseCreateDashboardRequest } from "#validators/dashboard.validator";

export const createDashboard = async (req: Request, res: Response) => {
  logger.info("[createDashboard] Incoming request");

  try {
    const input = parseCreateDashboardRequest(req);

    const result = await DashboardService.createDashboard(input);

    logger.info("[createDashboard] Dashboard created", {
      dashboardId: result.dashboardId,
    });

    return res.status(201).json(result);
  } catch (err: any) {
    logger.error("[createDashboard] Failed", err);
    return res.status(err.statusCode ?? 500).json({
      error: err.message ?? "Failed to create dashboard",
    });
  }
};

export const updateDashboard = async (req: Request, res: Response) => {
  logger.info("[updateDashboard] Incoming request");

  try {
    const input = parseCreateDashboardRequest(req, true);

    const result = await DashboardService.updateDashboard(input);

    logger.info("[updateDashboard] Dashboard updated", {
      dashboardId: result.dashboardId,
    });

    return res.json(result);
  } catch (err: any) {
    logger.error("[updateDashboard] Failed", err);
    return res.status(err.statusCode ?? 500).json({
      error: err.message ?? "Failed to update dashboard",
    });
  }
};
