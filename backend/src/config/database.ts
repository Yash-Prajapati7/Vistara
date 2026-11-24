import mongoose from 'mongoose';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

/**
 * Connects to MongoDB cluster with resilient error handling and event listeners.
 */
export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || DB_CONSTANTS.DEFAULT_MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || DB_CONSTANTS.DEFAULT_DB_NAME;

  if (isConnected) {
    logger.info('Database connection already established.');
    return;
  }

  // Register connection event listeners
  mongoose.connection.on(DB_CONSTANTS.EVENT_CONNECTED, () => {
    isConnected = true;
    logger.info(`MongoDB connection established successfully to database: ${dbName}`);
  });

  mongoose.connection.on(DB_CONSTANTS.EVENT_ERROR, (err: unknown) => {
    isConnected = false;
    logger.error('MongoDB connection encountered an error', err);
  });

  mongoose.connection.on(DB_CONSTANTS.EVENT_DISCONNECTED, () => {
    isConnected = false;
    logger.warn('MongoDB connection disconnected. Attempting reconnection...');
  });

  try {
    logger.info('Connecting to MongoDB');
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
  } catch (error: unknown) {
    isConnected = false;
    logger.error(DB_CONSTANTS.ERR_CONNECTION_FAILED, error);
    // Don't crash immediately; allow offline resilience or subsequent retries
  }
}

/**
 * Disconnects from MongoDB gracefully during server shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB gracefully.');
  } catch (error: unknown) {
    logger.error('Error during MongoDB disconnection', error);
  }
}

/**
 * Returns current database status for health check endpoints.
 */
export function getDatabaseStatus(): string {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return DB_CONSTANTS.STATUS_CONNECTED;
    case 2:
      return DB_CONSTANTS.STATUS_CONNECTING;
    default:
      return DB_CONSTANTS.STATUS_DISCONNECTED;
  }
}
