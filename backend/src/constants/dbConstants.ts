/**
 * Centralized database constants for MongoDB collections, fields, and queries.
 * Strictly adheres to .agents/agents.md - zero plain strings in handlers or models.
 */
export const DB_CONSTANTS = {
  // Collections
  COLLECTION_USERS: 'users',
  COLLECTION_CHATS: 'chats',

  // Common Document Fields
  FIELD_ID: '_id',
  FIELD_CREATED_AT: 'createdAt',
  FIELD_UPDATED_AT: 'updatedAt',

  // User Document Fields
  FIELD_USER_ID: 'userId',
  FIELD_NAME: 'name',
  FIELD_EMAIL: 'email',
  FIELD_INITIALS: 'initials',
  FIELD_AVATAR_URL: 'avatarUrl',
  FIELD_TIER: 'tier',
  FIELD_SCANS_REMAINING: 'scansRemaining',

  // Chat Document Fields
  FIELD_SESSION_ID: 'sessionId',
  FIELD_TITLE: 'title',
  FIELD_CROP_TYPE: 'cropType',
  FIELD_TURNS: 'turns',

  // Turn Fields
  FIELD_TURN_ID: 'turnId',
  FIELD_PROMPT: 'prompt',
  FIELD_COMPLETION: 'completion',
  FIELD_IMAGE_BASE64: 'imageBase64',
  FIELD_IMAGE_META: 'imageMeta',
  FIELD_IMAGE_NAME: 'name',
  FIELD_IMAGE_MIME_TYPE: 'mimeType',
  FIELD_IMAGE_SIZE_BYTES: 'sizeBytes',
  FIELD_VIDEO_BASE64: 'videoBase64',
  FIELD_VIDEO_META: 'videoMeta',
  FIELD_VIDEO_NAME: 'name',
  FIELD_VIDEO_MIME_TYPE: 'mimeType',
  FIELD_VIDEO_SIZE_BYTES: 'sizeBytes',
  FIELD_VIDEO_DURATION: 'durationSeconds',
  FIELD_THINKING_CONTENT: 'thinkingContent',
  FIELD_DIAGNOSTIC_DATA: 'diagnosticData',
  FIELD_TIMESTAMP: 'timestamp',

  // Diagnostic Data Fields
  FIELD_DIAG_CROP: 'crop',
  FIELD_DIAG_DISEASE: 'disease',
  FIELD_DIAG_PATHOGEN_TYPE: 'pathogenType',
  FIELD_DIAG_CONFIDENCE: 'confidence',
  FIELD_DIAG_SEVERITY: 'severity',
  FIELD_DIAG_SYMPTOMS: 'symptoms',
  FIELD_DIAG_ORGANIC_TREATMENT: 'organicTreatment',
  FIELD_DIAG_CHEMICAL_TREATMENT: 'chemicalTreatment',
  FIELD_DIAG_PREVENTATIVE_ACTION: 'preventativeAction',

  // Projection Keys
  PROJECTION_EXCLUDE_TURNS_IMAGE: 'turns.imageBase64',
  PROJECTION_EXCLUDE_TURNS_VIDEO: 'turns.videoBase64',
  PROJECTION_EXCLUDE_TURNS_THINKING: 'turns.thinkingContent',

  // Sort Directions & Query Operators
  SORT_DESCENDING: -1,
  SORT_ASCENDING: 1,

  // Default User Profiles & Fallbacks
  DEFAULT_USER_ID: 'usr_default_agronomist',
  DEFAULT_USER_NAME: 'Dr. Evelyn Morales',
  DEFAULT_USER_EMAIL: 'e.morales@agrivision-research.org',
  DEFAULT_USER_INITIALS: 'EM',
  DEFAULT_USER_TIER: 'RESEARCH PRO',
  DEFAULT_SCANS_REMAINING: '1,420 / 2,000 scans this cycle',
  DEFAULT_CHAT_TITLE: 'New Consultation',
  TITLE_GENERAL_CONSULTATION: 'General Consultation',
  TITLE_AGRONOMIC_CONSULTATION: 'Agronomic Consultation',
  TITLE_LEAF_SPECIMEN_SCAN: 'Leaf Specimen Scan',
  TITLE_FIELD_VIDEO_SCAN: 'Field Video Diagnostic Scan',

  // Connection & Lifecycle Event Strings
  EVENT_CONNECTED: 'connected',
  EVENT_DISCONNECTED: 'disconnected',
  EVENT_ERROR: 'error',
  EVENT_RECONNECTED: 'reconnected',

  // Database Error & Success Messages
  ERR_CONNECTION_FAILED: 'Failed to establish connection to MongoDB diagnostic database.',
  ERR_USER_NOT_FOUND: 'Agronomist user account not found in database.',
  ERR_CHAT_NOT_FOUND: 'Diagnostic chat session not found.',
  ERR_MISSING_USER_ID: 'User ID is mandatory for chat history operations.',
  ERR_SAVE_TURN_FAILED: 'Failed to record diagnostic turn in MongoDB.',
  ERR_DELETE_CHAT_FAILED: 'Failed to delete diagnostic chat session from database.',
  ERR_INVALID_SESSION_ID: 'Invalid or missing diagnostic session ID.',
  MSG_CHAT_DELETED_SUCCESS: 'Diagnostic case deleted successfully from database.',
  MSG_CHAT_RENAMED_SUCCESS: 'Diagnostic case title updated successfully.',

  RETURN_DOCUMENT_BEFORE: 'before',
  RETURN_DOCUMENT_AFTER: 'after',

  // Status Strings
  STATUS_CONNECTED: 'connected',
  STATUS_DISCONNECTED: 'disconnected',
  STATUS_CONNECTING: 'connecting',

  // Environment Defaults
  DEFAULT_MONGODB_URI: 'mongodb://127.0.0.1:27017/vistara_diagnostics',
  DEFAULT_DB_NAME: 'vistara_diagnostics',
} as const;
