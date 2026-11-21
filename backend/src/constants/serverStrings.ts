/**
 * Centralized server string constants for Vistara backend.
 * All API routes, SSE event tags, error codes, HTTP headers,
 * and diagnostic delimiters are maintained here.
 */
export const SERVER_STRINGS = {
  // Application Information
  APP_NAME: 'Vistara Backend',
  APP_VERSION: '1.0.0',
  SYSTEM_IDENTITY: 'VIsion-language System for Transformer-based Agricultural disease Recognition and Analysis',

  // API Routes
  ROUTE_ROOT: '/',
  ROUTE_HEALTH: '/api/health',
  ROUTE_CHAT: '/api/chat',
  ROUTE_TRANSLATE: '/translate',
  ROUTE_SESSION: '/api/chat/session',
  ROUTE_SUB_SESSION: '/session/:id',
  ROUTE_SUB_SESSION_TITLE: '/session/:id/title',
  ROUTE_USER_CHATS: '/user/:userId',
  ROUTE_USERS: '/api/users',
  ROUTE_USER_BY_ID: '/:userId',

  // HTTP Headers
  HEADER_CONTENT_TYPE: 'Content-Type',
  HEADER_CACHE_CONTROL: 'Cache-Control',
  HEADER_CONNECTION: 'Connection',
  MIME_EVENT_STREAM: 'text/event-stream',
  MIME_APPLICATION_JSON: 'application/json',
  CACHE_NO_CACHE: 'no-cache',
  CONNECTION_KEEP_ALIVE: 'keep-alive',

  //Empty String
  EMPTY_STRING: '',

  // SSE Protocol & Event Types
  EVENT_TEXT_DELTA: 'text-delta',
  EVENT_THINKING_DELTA: 'thinking-delta',
  EVENT_REASONING_DELTA: 'reasoning-delta',
  EVENT_DIAGNOSTIC_DATA: 'diagnostic-data',
  EVENT_DONE: 'done',
  EVENT_ERROR: 'error',
  SSE_DATA_PREFIX: 'data: ',
  SSE_DOUBLE_NEWLINE: '\n\n',

  // Reasoning & Thinking Delimiters
  TAG_THINK_OPEN: '<think>',
  TAG_THINK_CLOSE: '</think>',

  // Context & Roles
  ROLE_USER: 'user',
  ROLE_ASSISTANT: 'assistant',
  ROLE_SYSTEM: 'system',

  // Multimodal Message Content Types
  CONTENT_TYPE_TEXT: 'text',
  CONTENT_TYPE_IMAGE: 'image',
  CONTENT_TYPE_FILE: 'file',

  // Translation & Reasoning Options
  MODEL_ID_QWEN: 'alibaba/qwen3.7-flash',
  GATEWAY_OPTION_KEY: 'gateway',
  REASONING_OPTION_KEY: 'reasoning',
  REASONING_EFFORT_LOW: 'low',
  TRANSLATION_USER_PROMPT_PREFIX: 'Translate diagnosis to ',

  // Media MIME Types & Encodings
  MEDIA_TYPE_VIDEO_MP4: 'video/mp4',
  MEDIA_TYPE_IMAGE_JPEG: 'image/jpeg',
  BASE64_DATA_URL_PREFIX_REGEX: /^data:[^;]+;base64,/,
  BASE64_ENCODING: 'base64' as BufferEncoding,

  // Defaults & Server Configuration
  DEFAULT_SPECIMEN_NAME: 'crop_specimen.jpg',
  DEFAULT_VIDEO_NAME: 'crop_field_video.mp4',
  DEFAULT_BODY_LIMIT: '50mb',
  DEFAULT_PORT: '5000',
  DEFAULT_ORIGIN_VITE: 'http://localhost:5173',
  DEFAULT_ORIGIN_REACT: 'http://localhost:3000',
  ENV_DEVELOPMENT: 'development',

  // Type Identifiers
  TYPEOF_FUNCTION: 'function',
  TYPEOF_NUMBER: 'number',

  // Status & Success Messages
  STATUS_HEALTHY: 'healthy',
  STATUS_SUCCESS: 'success',
  STATUS_ERROR: 'error',
  SESSION_CLEARED: 'Session context cleared successfully.',

  // Error Messages
  ERR_INTERNAL_SERVER: 'Internal server error occurred during diagnostic processing.',
  ERR_MISSING_PROMPT: 'A valid text prompt or disease query is required.',
  ERR_MISSING_TRANSLATION_PARAMS: 'Content and target language are required for translation.',
  ERR_SESSION_NOT_FOUND: 'Diagnostic session context not found.',
  ERR_INVALID_PAYLOAD: 'Invalid request payload format.',
  ERR_AI_GENERATION_FAILED: 'Failed to generate diagnostic response from vision-language model.',
  ERR_UNHANDLED_PIPELINE: 'Unhandled server error in request pipeline',
  ERR_GET_USER_FAILED: 'Failed to get user ',

  // Log Prefixes (strictly text-only, no emojis)
  LOG_PREFIX_INFO: '[INFO]',
  LOG_PREFIX_WARN: '[WARN]',
  LOG_PREFIX_ERROR: '[ERROR]',
  LOG_PREFIX_DEBUG: '[DEBUG]',
  LOG_SERVER_STARTED: 'Vistara agricultural diagnostic server listening on port',
} as const;
