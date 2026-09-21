import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SERVER_STRINGS } from './constants/serverStrings.js';
import { healthRouter } from './routes/healthRoutes.js';
import { chatRouter } from './routes/chatRoutes.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

export function createApp(): Express {
  const app = express();

  // Cross-Origin Resource Sharing
  const allowedOrigin = process.env.FRONTEND_ORIGIN || SERVER_STRINGS.DEFAULT_ORIGIN_VITE;
  app.use(
    cors({
      origin: [allowedOrigin, SERVER_STRINGS.DEFAULT_ORIGIN_REACT, SERVER_STRINGS.DEFAULT_ORIGIN_VITE],
      credentials: true,
    })
  );

  // Body payload limit for multimodal base64 crop foliage images
  const payloadLimit = process.env.BODY_LIMIT || SERVER_STRINGS.DEFAULT_BODY_LIMIT;

  // Parse JSON payloads with increased limit to support base64 crop foliage images
  app.use(express.json({ limit: payloadLimit }));
  app.use(express.urlencoded({ extended: true, limit: payloadLimit }));

  // Mount API route modules
  app.use(SERVER_STRINGS.ROUTE_HEALTH, healthRouter);
  app.use(SERVER_STRINGS.ROUTE_CHAT, chatRouter);

  // Global error handler
  app.use(globalErrorHandler);

  return app;
}
