import { SERVER_STRINGS } from '../constants/serverStrings.js';

/**
 * Standardized logging utility for Vistara backend.
 * Conforms to zero-emoji policy and provides formatted timestamps.
 */
export const logger = {
  info(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const meta = context ? ` ${JSON.stringify(context)}` : '';
    console.log(`${SERVER_STRINGS.LOG_PREFIX_INFO} [${timestamp}] ${message}${meta}`);
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const meta = context ? ` ${JSON.stringify(context)}` : '';
    console.warn(`${SERVER_STRINGS.LOG_PREFIX_WARN} [${timestamp}] ${message}${meta}`);
  },

  error(message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();
    let errorDetail = '';
    if (error instanceof Error) {
      errorDetail = ` - ${error.name}: ${error.message}\n${error.stack || ''}`;
    } else if (error) {
      errorDetail = ` - ${JSON.stringify(error)}`;
    }
    console.error(`${SERVER_STRINGS.LOG_PREFIX_ERROR} [${timestamp}] ${message}${errorDetail}`);
  },

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      const meta = context ? ` ${JSON.stringify(context)}` : '';
      console.debug(`${SERVER_STRINGS.LOG_PREFIX_DEBUG} [${timestamp}] ${message}${meta}`);
    }
  },
};
