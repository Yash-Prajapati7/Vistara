import { SessionContext } from '../types/context.js';
import { DiagnosticData } from '../types/pathology.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { logger } from '../utils/logger.js';

/**
 * In-memory context store managing multi-turn dialogue state.
 * Stores sent user prompts in an array and tracks the last model response.
 */
class ContextService {
  private sessions = new Map<string, SessionContext>();

  /**
   * Retrieves an existing session or initializes a new context session.
   */
  public getOrCreateSession(providedSessionId?: string): SessionContext {
    const sessionId = providedSessionId || `${MODEL_CONFIG.DEFAULT_SESSION_PREFIX}${Date.now()}`;
    let session = this.sessions.get(sessionId);

    if (!session) {
      const now = Date.now();
      session = {
        sessionId,
        prompts: [],
        lastResponse: null,
        lastDiagnosticData: null,
        createdAt: now,
        updatedAt: now,
      };
      
      this.sessions.set(sessionId, session);
      logger.info('Initialized new diagnostic context session', { sessionId });
    }

    return session;
  }

  /**
   * Stores a user prompt into the session's prompts array.
   */
  public recordUserPrompt(sessionId: string, promptText: string, hasImage: boolean): void {
    const session = this.getOrCreateSession(sessionId);
    const trimmedPrompt = promptText.trim();

    // Store directly in prompts array
    session.prompts.push(trimmedPrompt);

    // Limit array history length to prevent memory leaks while retaining context
    if (session.prompts.length > MODEL_CONFIG.MAX_PROMPT_HISTORY_ITEMS) {
      session.prompts.shift();
    }

    session.updatedAt = Date.now();
    logger.info('Recorded user prompt to context array', {
      sessionId,
      totalPromptsCount: session.prompts.length,
      hasImage,
    });
  }

  /**
   * Retrieves the accumulated array of sent prompts for a session.
   */
  public getStoredPrompts(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session ? [...session.prompts] : [];
  }

  /**
   * Retrieves the last model response for a session.
   */
  public getLastModelResponse(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    return session?.lastResponse || null;
  }

  /**
   * Updates the last provided response and structured diagnostic data from the model.
   */
  public updateModelResponse(
    sessionId: string,
    fullResponse: string,
    diagnosticData?: DiagnosticData | null
  ): void {
    const session = this.getOrCreateSession(sessionId);
    session.lastResponse = fullResponse;
    if (diagnosticData) {
      session.lastDiagnosticData = diagnosticData;
    }
    session.updatedAt = Date.now();

    logger.info('Updated context with last model response and diagnostic state', {
      sessionId,
      hasDiagnosticData: Boolean(diagnosticData),
      crop: diagnosticData?.crop,
      disease: diagnosticData?.disease,
    });
  }

  /**
   * Clears context state for a given session.
   */
  public deleteSession(sessionId: string): boolean {
    const existed = this.sessions.delete(sessionId);
    if (existed) {
      logger.info('Deleted session context', { sessionId });
    }
    return existed;
  }

  /**
   * Returns a snapshot of a session context.
   */
  public getSession(sessionId: string): SessionContext | null {
    return this.sessions.get(sessionId) || null;
  }
}

export const contextService = new ContextService();
