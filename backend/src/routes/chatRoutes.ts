import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { validateChatRequest, validateTranslationRequest } from '../middleware/requestValidator.js';
import { chatDiagnosticService } from '../services/chatDiagnosticService.js';
import { chatHistoryService } from '../services/chatHistoryService.js';
import { contextService } from '../services/contextService.js';
import { logger } from '../utils/logger.js';

export const chatRouter = Router();

/**
 * POST /api/chat
 * Streams vision-language diagnostic response using Server-Sent Events (SSE).
 * Business logic, SSE coordination, reasoning tag parsing, and MongoDB persistence
 * are handled within chatDiagnosticService.
 */
chatRouter.post(
  SERVER_STRINGS.ROUTE_ROOT,
  validateChatRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { sessionId, userId, prompt, image, video, modelId } = req.body;

    await chatDiagnosticService.streamDiagnosis({
      res,
      clientSessionId: sessionId,
      clientUserId: userId,
      prompt,
      image,
      video,
      modelId,
    });
  }
);

/**
 * POST /api/chat/translate
 * Streams multilingual translation of an existing diagnostic report targeting alibaba/qwen3.7-flash.
 * Preserves Markdown report structure and trailing DiagnosticData JSON code blocks.
 */
chatRouter.post(
  SERVER_STRINGS.ROUTE_TRANSLATE,
  validateTranslationRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { sessionId, userId, content, targetLanguage } = req.body;

    await chatDiagnosticService.streamTranslation({
      res,
      clientSessionId: sessionId,
      clientUserId: userId,
      content,
      targetLanguage,
    });
  }
);

/**
 * GET /api/chat/user/:userId
 * Retrieves all chat sessions for a specific user, sorted newest first.
 * Excludes heavy base64 strings for fast loading.
 */
chatRouter.get(
  SERVER_STRINGS.ROUTE_USER_CHATS,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawUserId = req.params.userId;
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : String(rawUserId);

      if (!userId) {
        res.status(400).json({ error: DB_CONSTANTS.ERR_MISSING_USER_ID });
        return;
      }

      const conversations = await chatHistoryService.getUserChats(userId);
      res.status(200).json({
        status: SERVER_STRINGS.STATUS_SUCCESS,
        userId,
        count: conversations.length,
        conversations,
      });
    } catch (error: unknown) {
      logger.error('Failed to retrieve user chats from MongoDB', error);
      res.status(500).json({ error: SERVER_STRINGS.ERR_INTERNAL_SERVER });
    }
  }
);

/**
 * GET /api/chat/session/:id
 * Returns complete dialogue history from MongoDB (including base64 images and turns),
 * or falls back to in-memory context state.
 */
chatRouter.get(
  SERVER_STRINGS.ROUTE_SUB_SESSION,
  async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId);

    try {
      const details = await chatDiagnosticService.getSessionDetails(sessionId);
      if (!details) {
        res.status(404).json({
          error: SERVER_STRINGS.ERR_SESSION_NOT_FOUND,
          sessionId,
        });
        return;
      }

      res.status(200).json(details);
    } catch (error: unknown) {
      logger.error('Failed to get session details', error);
      res.status(500).json({ error: SERVER_STRINGS.ERR_INTERNAL_SERVER });
    }
  }
);

/**
 * PATCH /api/chat/session/:id/title
 * Updates the title of an existing chat session.
 */
chatRouter.patch(
  SERVER_STRINGS.ROUTE_SUB_SESSION_TITLE,
  async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const { title, userId } = req.body;

    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: SERVER_STRINGS.ERR_INVALID_PAYLOAD });
      return;
    }

    try {
      const updated = await chatHistoryService.updateChatTitle(sessionId, userId, title);
      if (!updated) {
        res.status(404).json({ error: DB_CONSTANTS.ERR_CHAT_NOT_FOUND, sessionId });
        return;
      }

      res.status(200).json({
        status: SERVER_STRINGS.STATUS_SUCCESS,
        message: DB_CONSTANTS.MSG_CHAT_RENAMED_SUCCESS,
        sessionId,
        title: title.trim(),
      });
    } catch (error: unknown) {
      logger.error('Failed to rename chat session', error);
      res.status(500).json({ error: SERVER_STRINGS.ERR_INTERNAL_SERVER });
    }
  }
);

/**
 * DELETE /api/chat/session/:id
 * Permanently deletes chat from MongoDB and clears any in-memory cache.
 */
chatRouter.delete(
  SERVER_STRINGS.ROUTE_SUB_SESSION,
  async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const rawUserId = req.query.userId || req.body?.userId;
    const userId = rawUserId ? String(rawUserId) : undefined;

    try {
      // Delete from MongoDB persistent collection if connected
      const dbDeleted = mongoose.connection.readyState === 1
        ? await chatHistoryService.deleteSession(sessionId, userId)
        : false;

      // Clear memory context as well
      const memDeleted = contextService.deleteSession(sessionId);

      if (!dbDeleted && !memDeleted) {
        res.status(404).json({
          error: DB_CONSTANTS.ERR_CHAT_NOT_FOUND,
          sessionId,
        });
        return;
      }

      res.status(200).json({
        status: SERVER_STRINGS.STATUS_SUCCESS,
        message: DB_CONSTANTS.MSG_CHAT_DELETED_SUCCESS,
        sessionId,
      });
    } catch (error: unknown) {
      logger.error('Failed to delete chat session from database', error);
      res.status(500).json({ error: DB_CONSTANTS.ERR_DELETE_CHAT_FAILED });
    }
  }
);
