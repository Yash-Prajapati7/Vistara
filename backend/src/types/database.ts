import { DiagnosticData } from './pathology.js';

/**
 * Agronomist / Farmer user entity stored in MongoDB.
 */
export interface User {
  userId: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  tier: 'RESEARCH PRO' | 'FIELD ADVISOR' | 'STANDARD';
  scansRemaining: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Image metadata associated with a diagnostic query.
 */
export interface DiagnosticImageMeta {
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

/**
 * Video metadata associated with a diagnostic query.
 */
export interface DiagnosticVideoMeta {
  name: string;
  mimeType: string;
  sizeBytes?: number;
  durationSeconds?: number;
}

/**
 * Represents a single turn in a diagnostic conversation.
 * Stores prompt, completion, imageBase64/videoBase64 sent to the LLM, thinking deltas, and diagnostic data.
 */
export interface ChatTurn {
  turnId: string;
  prompt: string;
  completion: string;
  imageBase64?: string;
  imageMeta?: DiagnosticImageMeta;
  videoBase64?: string;
  videoMeta?: DiagnosticVideoMeta;
  thinkingContent?: string;
  diagnosticData?: DiagnosticData;
  timestamp: Date;
}

/**
 * Full chat conversation document stored in MongoDB.
 * Indexed by userId for quick retrieval when an agronomist logs in.
 */
export interface ChatDocument {
  sessionId: string;
  userId: string;
  title: string;
  cropType?: string;
  turns: ChatTurn[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lightweight summary of a chat session used in conversation lists.
 * Excludes heavy imageBase64 strings for fast network transmission.
 */
export interface ChatSummary {
  sessionId: string;
  userId: string;
  title: string;
  cropType?: string;
  updatedAt: string;
  previewSnippet: string;
  turnCount: number;
}
