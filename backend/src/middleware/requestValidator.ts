import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SERVER_STRINGS } from '../constants/serverStrings.js';

const imageAttachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(SERVER_STRINGS.DEFAULT_SPECIMEN_NAME),
  url: z.string().optional(),
  data: z.string().optional(),
  mimeType: z.string().optional(),
}).optional();

const videoAttachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(SERVER_STRINGS.DEFAULT_VIDEO_NAME),
  url: z.string().optional(),
  data: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  durationSeconds: z.number().optional(),
}).optional();

const chatRequestSchema = z.object({
  sessionId: z.string().optional(),
  prompt: z.string().min(1, SERVER_STRINGS.ERR_MISSING_PROMPT),
  image: imageAttachmentSchema,
  video: videoAttachmentSchema,
  modelId: z.string().optional(),
});

const translationRequestSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  content: z.string().min(1, SERVER_STRINGS.ERR_MISSING_TRANSLATION_PARAMS),
  targetLanguage: z.string().min(1, SERVER_STRINGS.ERR_MISSING_TRANSLATION_PARAMS),
  targetLanguageCode: z.string().optional(),
});

/**
 * Validates incoming chat/diagnostic requests against schema.
 */
export function validateChatRequest(req: Request, res: Response, next: NextFunction): void {
  const result = chatRequestSchema.safeParse(req.body);

  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      error: SERVER_STRINGS.ERR_INVALID_PAYLOAD,
      details: errorDetails,
    });
    return;
  }

  req.body = result.data;
  next();
}

/**
 * Validates incoming translation requests against schema.
 */
export function validateTranslationRequest(req: Request, res: Response, next: NextFunction): void {
  const result = translationRequestSchema.safeParse(req.body);

  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      error: SERVER_STRINGS.ERR_INVALID_PAYLOAD,
      details: errorDetails,
    });
    return;
  }

  req.body = result.data;
  next();
}
