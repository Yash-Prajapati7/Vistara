import { createApp } from './app.js';
import { SERVER_STRINGS } from './constants/serverStrings.js';
import { MODEL_CONFIG } from './constants/modelConfig.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || SERVER_STRINGS.DEFAULT_PORT, 10);
const app = createApp();

// Connect to MongoDB database
await connectDatabase();

const server = app.listen(PORT, () => {
  logger.info(`${SERVER_STRINGS.LOG_SERVER_STARTED} ${PORT}`, {
    environment: process.env.NODE_ENV || SERVER_STRINGS.ENV_DEVELOPMENT,
    model: process.env.AI_MODEL_ID || MODEL_CONFIG.DEFAULT_MODEL_ID,
    healthEndpoint: `http://localhost:${PORT}${SERVER_STRINGS.ROUTE_HEALTH}`,
    chatEndpoint: `http://localhost:${PORT}${SERVER_STRINGS.ROUTE_CHAT}`,
  });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down diagnostic server gracefully...');
  await disconnectDatabase();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down diagnostic server gracefully...');
  await disconnectDatabase();
  server.close(() => {
    process.exit(0);
  });
});
