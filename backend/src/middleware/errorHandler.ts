import { Request, Response, NextFunction } from 'express';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { logger } from '../utils/logger.js';

/**
 * Global centralized error handling middleware.
 * Uses centralized strings and ensures zero emojis in responses and logs.
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(SERVER_STRINGS.ERR_UNHANDLED_PIPELINE, err);

  const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  const message = err instanceof Error ? err.message : SERVER_STRINGS.ERR_INTERNAL_SERVER;

  res.status(statusCode).json({
    status: SERVER_STRINGS.STATUS_ERROR,
    error: SERVER_STRINGS.ERR_INTERNAL_SERVER,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}
