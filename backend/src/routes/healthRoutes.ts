import { Router, Request, Response } from 'express';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { HealthResponsePayload } from '../types/api.js';
import { getDatabaseStatus } from '../config/database.js';

export const healthRouter = Router();

/**
 * Health check endpoint providing runtime diagnostics, database status, and model identity.
 */
healthRouter.get(SERVER_STRINGS.ROUTE_ROOT, (_req: Request, res: Response) => {
  const payload: HealthResponsePayload = {
    status: SERVER_STRINGS.STATUS_HEALTHY,
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    model: process.env.AI_MODEL_ID || MODEL_CONFIG.DEFAULT_MODEL_ID,
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || SERVER_STRINGS.ENV_DEVELOPMENT,
  };

  res.status(200).json(payload);
});
