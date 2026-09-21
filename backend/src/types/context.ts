import { DiagnosticData } from './pathology.js';

/**
 * Multi-turn context management types for Vistara.
 * Stores sent user prompts in an array and tracks the last model response.
 */
export interface SessionContext {
  sessionId: string;
  prompts: string[];                 // Array of sent user prompts in this session
  lastResponse: string | null;       // Last provided response from the model
  lastDiagnosticData: DiagnosticData | null; // Last structured diagnosis
  createdAt: number;
  updatedAt: number;
}
