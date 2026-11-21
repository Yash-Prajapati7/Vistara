import { Response } from 'express';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { contextService } from './contextService.js';
import { chatHistoryService } from './chatHistoryService.js';
import { streamPathologyDiagnosis, streamPathologyTranslation } from './aiService.js';
import { parseModelResponse } from './responseParser.js';
import { ImageAttachmentPayload, VideoAttachmentPayload } from '../types/pathology.js';
import { logger } from '../utils/logger.js';

export interface StreamDiagnosisOptions {
  res: Response;
  clientSessionId?: string;
  clientUserId?: string;
  prompt: string;
  image?: ImageAttachmentPayload;
  video?: VideoAttachmentPayload;
  modelId?: string;
}

export interface StreamTranslationOptions {
  res: Response;
  clientSessionId?: string;
  clientUserId?: string;
  content: string;
  targetLanguage: string;
  modelId?: string;
}

export class ChatDiagnosticService {
  /**
   * Orchestrates the entire vision-language diagnostic streaming pipeline:
   * 1. Session resolution and MongoDB turn persistence
   * 2. SSE streaming headers initialization
   * 3. AI SDK streaming with real-time reasoning and text delta dispatch
   * 4. Structured response parsing and completion persistence in MongoDB & context cache
   * 5. Emitting diagnostic metadata and stream termination markers
   */
  public async streamDiagnosis({
    res,
    clientSessionId,
    clientUserId,
    prompt,
    image,
    video,
    modelId,
  }: StreamDiagnosisOptions): Promise<void> {
    const userId = clientUserId || DB_CONSTANTS.DEFAULT_USER_ID;

    // Retrieve or generate session
    const session = contextService.getOrCreateSession(clientSessionId);
    const sessionId = session.sessionId;

    // Persist user turn and image/video base64 directly into MongoDB chat history
    try {
      await chatHistoryService.recordUserTurn(sessionId, userId, prompt, image, video);
    } catch (dbError: unknown) {
      logger.error('Failed to record user turn in database', dbError);
    }

    // Configure headers for real-time Server-Sent Events (SSE) streaming
    res.setHeader(SERVER_STRINGS.HEADER_CONTENT_TYPE, SERVER_STRINGS.MIME_EVENT_STREAM);
    res.setHeader(SERVER_STRINGS.HEADER_CACHE_CONTROL, SERVER_STRINGS.CACHE_NO_CACHE);
    res.setHeader(SERVER_STRINGS.HEADER_CONNECTION, SERVER_STRINGS.CONNECTION_KEEP_ALIVE);

    if (typeof res.flushHeaders === SERVER_STRINGS.TYPEOF_FUNCTION) {
      res.flushHeaders();
    }

    let fullResponseText = '';
    let fullThinkingText = '';

    try {
      // Execute vision-language streaming pipeline with context understanding
      const streamResult = await streamPathologyDiagnosis({
        sessionId,
        currentPrompt: prompt,
        image,
        video,
        modelId,
      });

      let isInsideThinkTag = false;

      // Stream full parts (reasoning deltas and text deltas) to client as they are generated
      for await (const part of streamResult.fullStream) {
        if (part.type === SERVER_STRINGS.EVENT_REASONING_DELTA) {
          fullThinkingText += part.text;
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
                fullThinkingText += parts[0];
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
              fullThinkingText += text;
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

      // Persist into in-memory context cache
      contextService.updateModelResponse(sessionId, fullResponseText, diagnosticData);

      // Persist completion and structured diagnosis into MongoDB
      try {
        await chatHistoryService.recordCompletion(
          sessionId,
          markdownReport || fullResponseText,
          diagnosticData,
          fullThinkingText
        );
      } catch (dbSaveError: unknown) {
        logger.error('Failed to persist LLM completion to MongoDB', dbSaveError);
      }

      // Emit structured diagnostic data event for rich UI rendering ONLY if diagnosis was generated
      if (diagnosticData) {
        res.write(
          `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
            type: SERVER_STRINGS.EVENT_DIAGNOSTIC_DATA,
            diagnosticData,
            markdownReport,
            sessionId,
          })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
        );
      }

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

  /**
   * Orchestrates streaming multilingual translation targeting alibaba/qwen3.7-flash:
   * 1. Records a synthetic user prompt in MongoDB chat history
   * 2. SSE streaming text deltas to client
   * 3. Response parsing for structured diagnostic card retention
   * 4. Completion persistence in MongoDB
   */
  public async streamTranslation({
    res,
    clientSessionId,
    clientUserId,
    content,
    targetLanguage,
    modelId,
  }: StreamTranslationOptions): Promise<void> {
    const userId = clientUserId || DB_CONSTANTS.DEFAULT_USER_ID;
    const session = contextService.getOrCreateSession(clientSessionId);
    const sessionId = session.sessionId;

    // Record synthetic translation request turn in MongoDB chat history
    const userPrompt = `${SERVER_STRINGS.TRANSLATION_USER_PROMPT_PREFIX}${targetLanguage}`;
    try {
      await chatHistoryService.recordUserTurn(sessionId, userId, userPrompt);
    } catch (dbError: unknown) {
      logger.error('Failed to record translation user turn in database', dbError);
    }

    res.setHeader(SERVER_STRINGS.HEADER_CONTENT_TYPE, SERVER_STRINGS.MIME_EVENT_STREAM);
    res.setHeader(SERVER_STRINGS.HEADER_CACHE_CONTROL, SERVER_STRINGS.CACHE_NO_CACHE);
    res.setHeader(SERVER_STRINGS.HEADER_CONNECTION, SERVER_STRINGS.CONNECTION_KEEP_ALIVE);

    if (typeof res.flushHeaders === SERVER_STRINGS.TYPEOF_FUNCTION) {
      res.flushHeaders();
    }

    let fullResponseText = '';

    try {
      const streamResult = await streamPathologyTranslation({
        content,
        targetLanguage,
        modelId,
      });

      for await (const part of streamResult.fullStream) {
        if (part.type === SERVER_STRINGS.EVENT_TEXT_DELTA) {
          fullResponseText += part.text;
          res.write(
            `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
              type: SERVER_STRINGS.EVENT_TEXT_DELTA,
              text: part.text,
            })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
          );
        }
      }

      // Parse translated response to extract structured DiagnosticData if present
      const { markdownReport, diagnosticData } = parseModelResponse(fullResponseText);

      // Persist completion and structured diagnosis into MongoDB
      try {
        await chatHistoryService.recordCompletion(
          sessionId,
          markdownReport || fullResponseText,
          diagnosticData,
          SERVER_STRINGS.EMPTY_STRING
        );
      } catch (dbSaveError: unknown) {
        logger.error('Failed to persist translated completion to MongoDB', dbSaveError);
      }

      // Emit diagnostic data event if structured card is present
      if (diagnosticData) {
        res.write(
          `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
            type: SERVER_STRINGS.EVENT_DIAGNOSTIC_DATA,
            diagnosticData,
            markdownReport,
            sessionId,
          })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
        );
      }

      res.write(
        `${SERVER_STRINGS.SSE_DATA_PREFIX}${JSON.stringify({
          type: SERVER_STRINGS.EVENT_DONE,
          sessionId,
        })}${SERVER_STRINGS.SSE_DOUBLE_NEWLINE}`
      );
      res.end();
      logger.info('Completed diagnostic translation streaming', { sessionId, targetLanguage });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : SERVER_STRINGS.ERR_AI_GENERATION_FAILED;
      logger.error('Translation streaming failed', error);

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

  /**
   * Retrieves session details checking MongoDB persistent store first,
   * falling back to in-memory context store.
   */
  public async getSessionDetails(sessionId: string) {
    const fullChat = await chatHistoryService.getFullSession(sessionId);
    if (fullChat) {
      const lastTurn = fullChat.turns[fullChat.turns.length - 1];
      return {
        sessionId: fullChat.sessionId,
        userId: fullChat.userId,
        title: fullChat.title,
        cropType: fullChat.cropType,
        turns: fullChat.turns,
        prompts: fullChat.turns.map((t) => t.prompt),
        hasLastResponse: Boolean(lastTurn?.completion),
        lastDiagnosticData: lastTurn?.diagnosticData || null,
        createdAt: fullChat.createdAt ? new Date(fullChat.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: fullChat.updatedAt ? new Date(fullChat.updatedAt).toISOString() : new Date().toISOString(),
      };
    }

    const session = contextService.getSession(sessionId);
    if (session) {
      return {
        sessionId: session.sessionId,
        prompts: session.prompts,
        hasLastResponse: Boolean(session.lastResponse),
        lastDiagnosticData: session.lastDiagnosticData,
        createdAt: new Date(session.createdAt).toISOString(),
        updatedAt: new Date(session.updatedAt).toISOString(),
      };
    }

    return null;
  }
}

export const chatDiagnosticService = new ChatDiagnosticService();
