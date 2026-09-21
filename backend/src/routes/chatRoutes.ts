import { Router, Request, Response } from 'express';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { validateChatRequest } from '../middleware/requestValidator.js';
import { contextService } from '../services/contextService.js';
import { streamPathologyDiagnosis } from '../services/aiService.js';
import { parseModelResponse } from '../services/responseParser.js';
import { logger } from '../utils/logger.js';

export const chatRouter = Router();

/**
 * POST /api/chat
 * Streams vision-language diagnostic response using Server-Sent Events (SSE).
 * Progressively emits text chunks, followed by validated DiagnosticData.
 */
chatRouter.post(
  SERVER_STRINGS.ROUTE_ROOT,
  validateChatRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { sessionId: clientSessionId, prompt, image, modelId } = req.body;

    // Retrieve or generate session
    const session = contextService.getOrCreateSession(clientSessionId);
    const sessionId = session.sessionId;

    // Configure headers for real-time Server-Sent Events (SSE) streaming
    res.setHeader(SERVER_STRINGS.HEADER_CONTENT_TYPE, SERVER_STRINGS.MIME_EVENT_STREAM);
    res.setHeader(SERVER_STRINGS.HEADER_CACHE_CONTROL, SERVER_STRINGS.CACHE_NO_CACHE);
    res.setHeader(SERVER_STRINGS.HEADER_CONNECTION, SERVER_STRINGS.CONNECTION_KEEP_ALIVE);

    if (typeof res.flushHeaders === SERVER_STRINGS.TYPEOF_FUNCTION) {
      res.flushHeaders();
    }

    let fullResponseText = '';

    try {
      // Execute vision-language streaming pipeline with context understanding
      const streamResult = await streamPathologyDiagnosis({
        sessionId,
        currentPrompt: prompt,
        image,
        modelId,
      });

      let isInsideThinkTag = false;

      // Stream full parts (reasoning deltas and text deltas) to client as they are generated
      for await (const part of streamResult.fullStream) {
        if (part.type === SERVER_STRINGS.EVENT_REASONING_DELTA) {
          res.write(
            `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
              type: SERVER_STRINGS.EVENT_THINKING_DELTA,
              text: part.text,
            })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
          );
        } else if (part.type === SERVER_STRINGS.EVENT_TEXT_DELTA) {
          let text = part.text;

          // Check for inline <think> tags if emitted directly in text stream
          if (!isInsideThinkTag && text.includes(SERVER_STRINGS.TAG_THINK_OPEN)) {
            isInsideThinkTag = true;
            const parts = text.split(SERVER_STRINGS.TAG_THINK_OPEN);
            if (parts[0]) {
              fullResponseText += parts[0];
              res.write(
                `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
                  type: SERVER_STRINGS.EVENT_TEXT_DELTA,
                  text: parts[0],
                })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
              );
            }
            text = parts[1] || '';
          }

          if (isInsideThinkTag) {
            if (text.includes(SERVER_STRINGS.TAG_THINK_CLOSE)) {
              isInsideThinkTag = false;
              const parts = text.split(SERVER_STRINGS.TAG_THINK_CLOSE);
              if (parts[0]) {
                res.write(
                  `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
                    type: SERVER_STRINGS.EVENT_THINKING_DELTA,
                    text: parts[0],
                  })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
                );
              }
              if (parts[1]) {
                fullResponseText += parts[1];
                res.write(
                  `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
                    type: SERVER_STRINGS.EVENT_TEXT_DELTA,
                    text: parts[1],
                  })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
                );
              }
            } else {
              res.write(
                `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
                  type: SERVER_STRINGS.EVENT_THINKING_DELTA,
                  text: text,
                })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
              );
            }
          } else {
            fullResponseText += text;
            res.write(
              `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
                type: SERVER_STRINGS.EVENT_TEXT_DELTA,
                text: text,
              })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
            );
          }
        }
      }

      // Parse complete response to extract Markdown report and structured DiagnosticData
      const { markdownReport, diagnosticData } = parseModelResponse(fullResponseText);

      // Persist last response and diagnostic data into session context
      contextService.updateModelResponse(sessionId, fullResponseText, diagnosticData);

      // Emit structured diagnostic data event for rich UI rendering
      res.write(
        `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
          type: SERVER_STRINGS.EVENT_DIAGNOSTIC_DATA,
          diagnosticData,
          markdownReport,
          sessionId,
        })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
      );

      // Emit completion marker
      res.write(
        `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
          type: SERVER_STRINGS.EVENT_DONE,
          sessionId,
        })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
      );

      res.end();
      logger.info('Completed diagnostic streaming for session', { sessionId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : SERVER_STRINGS.ERR_AI_GENERATION_FAILED;
      logger.error('Diagnostic streaming pipeline failed', error);

      if (!res.headersSent) {
        res.status(500).json({
          error: SERVER_STRINGS.ERR_AI_GENERATION_FAILED,
          message: errorMessage,
        });
        return;
      }

      res.write(
        `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
          type: SERVER_STRINGS.EVENT_ERROR,
          error: errorMessage,
        })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
      );
      res.end();
    }
  }
);

/**
 * GET /api/chat/session/:id
 * Returns current context state (stored prompts array and last model response).
 */
chatRouter.get(
  SERVER_STRINGS.ROUTE_SUB_SESSION,
  (req: Request, res: Response): void => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const session = contextService.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        error: SERVER_STRINGS.ERR_SESSION_NOT_FOUND,
        sessionId,
      });
      return;
    }

    res.status(200).json({
      sessionId: session.sessionId,
      prompts: session.prompts,
      hasLastResponse: Boolean(session.lastResponse),
      lastDiagnosticData: session.lastDiagnosticData,
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date(session.updatedAt).toISOString(),
    });
  }
);

/**
 * DELETE /api/chat/session/:id
 * Clears stored prompt array and last response context for a session.
 */
chatRouter.delete(
  SERVER_STRINGS.ROUTE_SUB_SESSION,
  (req: Request, res: Response): void => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const deleted = contextService.deleteSession(sessionId);

    if (!deleted) {
      res.status(404).json({
        error: SERVER_STRINGS.ERR_SESSION_NOT_FOUND,
        sessionId,
      });
      return;
    }

    res.status(200).json({
      status: SERVER_STRINGS.STATUS_SUCCESS,
      message: SERVER_STRINGS.SESSION_CLEARED,
      sessionId,
    });
  }
);
