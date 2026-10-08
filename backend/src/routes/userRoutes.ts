import { Router, Request, Response } from 'express';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { userService } from '../services/userService.js';
import { logger } from '../utils/logger.js';

export const userRouter = Router();

/**
 * GET /api/users/:userId
 * Retrieves user profile by userId.
 */
userRouter.get(
  SERVER_STRINGS.ROUTE_USER_BY_ID,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawUserId = req.params.userId;
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : String(rawUserId);

      if (!userId) {
        res.status(400).json({ error: DB_CONSTANTS.ERR_MISSING_USER_ID });
        return;
      }

      const user = await userService.getOrCreateUser(userId);
      res.status(200).json(user);
    } catch (error: unknown) {
      logger.error(SERVER_STRINGS.ERR_GET_USER_FAILED, error);
      res.status(500).json({ error: SERVER_STRINGS.ERR_INTERNAL_SERVER });
    }
  }
);
