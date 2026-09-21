import { DiagnosticData, ImageAttachmentPayload } from './pathology.js';

/**
 * API request and response payload types for Vistara.
 */
export interface ChatRequestBody {
  sessionId?: string;
  prompt: string;
  image?: ImageAttachmentPayload;
  modelId?: string;
}

export interface HealthResponsePayload {
  status: string;
  timestamp: string;
  model: string;
  uptimeSeconds: number;
  environment: string;
}

export interface SessionInfoPayload {
  sessionId: string;
  prompts: string[];
  hasLastResponse: boolean;
  lastDiagnosticData: DiagnosticData | null;
  createdAt: string;
  updatedAt: string;
}

export interface SSEMessagePayload {
  type: 'text-delta' | 'thinking-delta' | 'diagnostic-data' | 'done' | 'error';
  text?: string;
  diagnosticData?: DiagnosticData;
  markdownReport?: string;
  sessionId?: string;
  error?: string;
}
