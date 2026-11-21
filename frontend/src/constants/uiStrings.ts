/**
 * Centralized UI string constants for Vistara:
 * Vision-Language System for Transformer-based Agricultural Disease Recognition and Analysis.
 * Avoids raw string literals across components and maintains unified terminology.
 */
export const UI_STRINGS = {
  // Brand & Header
  BRAND_NAME: 'Vistara',
  BRAND_FULL_NAME: 'VIsion-language System for Transformer-based Agricultural disease Recognition and Analysis',
  BRAND_ACRONYM_SHORT: 'Transformer-based Agricultural Vision-Language System',
  BRAND_SUBTITLE: 'Plant Pathology & Crop Health Intelligence',
  APP_TITLE: 'Diagnostic Workspace',
  DEFAULT_CASE_TITLE: 'New Consultation',
  TITLE_GENERAL_CONSULTATION: 'General Consultation',
  TITLE_AGRONOMIC_CONSULTATION: 'Agronomic Consultation',
  MODEL_DEFAULT: 'Vistara AgriVision 2.0 (Transformer VL)',
  MODEL_BADGE: 'AGRI-VISION',

  // Actions & Buttons
  NEW_ANALYSIS: 'New Analysis',
  SEND: 'Analyze',
  SEND_MESSAGE: 'Send message',
  ATTACH_IMAGE: 'Upload crop or leaf photo',
  ATTACH_VIDEO: 'Upload crop or field video',
  ATTACH_MEDIA: 'Upload crop photo or field video',
  VOICE_INPUT: 'Dictate field notes',
  REMOVE_IMAGE: 'Remove photo',
  REMOVE_VIDEO: 'Remove video',
  SEARCH_PLACEHOLDER: 'Search crop diagnostic sessions...',
  INPUT_PLACEHOLDER: 'Ask a question, describe crop symptoms, or upload a leaf photo...',
  COLLAPSE_SIDEBAR: 'Collapse sidebar',
  EXPAND_SIDEBAR: 'Expand sidebar',
  CLEAR_CONVERSATION: 'Clear session',
  SHARE: 'Share report',
  COPY: 'Copy report',
  COPIED: 'Copied to clipboard!',
  REGENERATE: 'Re-analyze symptoms',
  THUMBS_UP: 'Accurate diagnosis',
  THUMBS_DOWN: 'Inaccurate diagnosis',
  RENAME: 'Rename case',
  DELETE: 'Delete case',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  CLOSE: 'Close',

  // Delete Confirmation Modal
  DELETE_MODAL_TITLE: 'Delete Conversation',
  DELETE_MODAL_DESCRIPTION: 'Are you sure you want to permanently delete this diagnostic session?',
  DELETE_MODAL_CONFIRM: 'Delete Session',
  DELETE_MODAL_CANCEL: 'Cancel',
  DELETE_MODAL_CLOSE_ARIA: 'Close delete confirmation dialog',

  // Theme & Appearance
  THEME_LIGHT: 'light',
  THEME_DARK: 'dark',
  THEME_STORAGE_KEY: 'vistara-theme',
  DARK_MODE: 'Dark Mode',
  LIGHT_MODE: 'Light Mode',
  SWITCH_TO_DARK: 'Switch to dark mode',
  SWITCH_TO_LIGHT: 'Switch to light mode',
  DARK_CLASS: 'dark',
  MEDIA_QUERY_DARK: '(prefers-color-scheme: dark)',
  TYPEOF_UNDEFINED: 'undefined',
  STATUS_ON: 'ON',
  STATUS_OFF: 'OFF',
  EVENT_MOUSEDOWN: 'mousedown',
  THEME_CONTEXT_ERROR: 'useTheme must be used within a ThemeProvider',

  // User Roles & Message Roles
  USER_ROLE_LABEL: 'Agronomist',
  FARMER_LABEL: 'Farmer',
  ROLE_USER: 'user',
  ROLE_ASSISTANT: 'assistant',

  // Feedback State & Icon Fills
  FEEDBACK_UP: 'up',
  FEEDBACK_DOWN: 'down',
  ICON_FILL_CURRENT: 'currentColor',
  ICON_FILL_NONE: 'none',

  // Diagnostic Report Labels
  DIAGNOSIS_SUMMARY: 'Pathology Assessment',
  PATHOGEN_LABEL: 'Pathogen',
  CONFIDENCE_LABEL: 'Confidence',
  SEVERITY_LABEL: 'Severity',
  CROP_LABEL: 'Target Crop',
  CHEMICAL_TREATMENT_LABEL: 'Targeted Chemical Countermeasure',
  ORGANIC_TREATMENT_LABEL: 'Organic / Bio-Control Alternative',
  PREVENTION_LABEL: 'Preventive Action',
  TREATMENT_PLAN: 'Recommended Intervention Regimen',
  PREVENTION_PLAN: 'Preventive Cultural Measures',

  // Account & Menu
  ACCOUNT: 'Agronomist Profile',
  ACCOUNT_TIER_PRO: 'RESEARCH PRO',
  USER_DEFAULT_NAME: 'Dr. Evelyn Morales',
  USER_DEFAULT_ROLE: 'Senior Crop Pathologist',
  USER_DEFAULT_EMAIL: 'e.morales@agrivision-research.org',
  SETTINGS: 'Diagnostic Preferences & Sensitivity',
  API_KEYS: 'Pathology Model APIs',
  DISEASE_LIBRARY: 'Crop Disease Knowledge Base',
  USAGE_BILLING: 'Monthly Crop Scans',
  SIGN_OUT: 'Sign Out',

  // Chat History Time Buckets & Keys
  TIME_BUCKET_TODAY: 'today',
  TIME_BUCKET_YESTERDAY: 'yesterday',
  TIME_BUCKET_PREVIOUS_WEEK: 'previous_week',
  TIME_TODAY: 'Today',
  TIME_YESTERDAY: 'Yesterday',
  TIME_PREVIOUS_WEEK: 'Previous 7 Days',
  NO_CHATS_FOUND: 'No matching crop diagnostic sessions found.',
  SEARCH_HINT: 'Ctrl + K',

  // Footers & Disclaimers
  DISCLAIMER: 'Vistara provides AI-assisted agricultural diagnostics. Cross-verify critical field treatments with local agricultural extension officers.',
  IMAGE_ATTACHED_LABEL: 'Attached crop specimen photo',
  VIDEO_ATTACHED_LABEL: 'Attached crop field video',
  DRAG_IMAGE_ACTIVE: 'Drop crop photo or video here...',
  GENERATING_RESPONSE: 'Generating response...',

  // Backend API Endpoints & Error Messages
  API_CHAT_ENDPOINT: '/api/chat',
  API_HEALTH_ENDPOINT: '/api/health',
  API_SESSION_ENDPOINT: '/api/chat/session',
  API_USER_CHATS_ENDPOINT: '/api/chat/user',
  TITLE_SUFFIX_ENDPOINT: 'title',
  DEFAULT_USER_ID: 'usr_default_agronomist',
  QUERY_USER_ID: 'userId',
  API_ERROR_NETWORK: 'Unable to reach Vistara pathology backend service. Check connection.',
  API_STREAM_ERROR: 'Diagnostic stream encountered an interruption.',

  // Server-Sent Events (SSE) Protocol Constants
  SSE_EVENT_TEXT_DELTA: 'text-delta',
  SSE_EVENT_THINKING_DELTA: 'thinking-delta',
  SSE_EVENT_DIAGNOSTIC_DATA: 'diagnostic-data',
  SSE_EVENT_DONE: 'done',
  SSE_EVENT_ERROR: 'error',
  SSE_DATA_PREFIX: 'data: ',

  // Diagnostic Thinking & Reasoning Showcase
  THINKING_HEADER: 'Reasoning Process',
  THINKING_IN_PROGRESS: 'Reasoning...',
  THINKING_SHOW_LABEL: 'Show diagnostic thinking',
  THINKING_HIDE_LABEL: 'Hide diagnostic thinking',
  THINKING_BADGE_STREAMING: 'Analyzing',
  THINKING_BADGE_COMPLETE: 'Thought Process',
  DERIVED_TITLE_LEAF_SCAN: 'Leaf Pathology Diagnostic Scan',
  DERIVED_TITLE_VIDEO_SCAN: 'Field Video Diagnostic Scan',
  DERIVED_TITLE_CROP_ANALYSIS: 'Crop Symptom Analysis',

  // HTTP & MIME Constants
  HTTP_HEADER_CONTENT_TYPE: 'Content-Type',
  HTTP_MIME_JSON: 'application/json',
  HTTP_MIME_JPEG: 'image/jpeg',
  HTTP_MIME_MP4: 'video/mp4',
  HTTP_RESPONSE_TYPE_TEXT: 'text' as const,

  // General Primitives & System Identifiers
  TYPEOF_STRING: 'string',
  NEWLINE_SEPARATOR: '\n',
  EMPTY_STRING: '',
  PATH_SEPARATOR: '/',
  MODEL_ID_QWEN: 'alibaba/qwen3.7-flash',
  MODEL_ID_MIMO: 'xiaomi/mimo-v2.6-flash',

  // Media & Upload Constraints
  ACCEPT_MEDIA_TYPES: 'image/png, image/jpeg, image/webp, image/gif, video/mp4, video/quicktime, video/webm',
  FILE_PREFIX_IMAGE: 'image/',
  FILE_PREFIX_VIDEO: 'video/',
  MAX_FILE_SIZE_BYTES: 52428800, // 50 MB
  ERR_FILE_TOO_LARGE: 'File exceeds maximum upload size (50 MB).',
  VIDEO_PLAYER_TITLE: 'Field Specimen Video',

  // Time & Locale Formatting
  TIME_FORMAT_2_DIGIT: '2-digit' as const,
  TIME_JUST_NOW: 'Just now',

  // Session & Specimen Defaults
  DEFAULT_CONVERSATION_ID: 'conv-1',
  DEFAULT_SPECIMEN_NAME: 'crop_foliage.jpg',
  DEFAULT_VIDEO_NAME: 'crop_field_video.mp4',
  FRESH_SESSION_SNIPPET: 'Ready for crop health questions or leaf specimen photos...',
  CROP_UNSPECIFIED: 'Unspecified',

  // ID Prefixes
  PREFIX_CONVERSATION: 'conv-',
  PREFIX_TURN_USER: 'u-',
  PREFIX_TURN_ASSISTANT: 'a-',
  PREFIX_TURN_IMAGE: 'img-',
  PREFIX_TURN_VIDEO: 'vid-',
  PREFIX_MSG_USER: 'msg-u-',
  PREFIX_MSG_ASSISTANT: 'msg-a-',

  // Clinical Diagnostic Notice & Alert Labels
  DIAGNOSTIC_ALERT_TITLE: 'Clinical Alert',
  DIAGNOSTIC_SERVICE_NOTICE_TITLE: 'Diagnostic Service Notice',
  DIAGNOSTIC_STREAM_INTERRUPTED_LABEL: 'Diagnostic stream interrupted',
  BACKEND_START_INSTRUCTIONS: 'Please ensure the Vistara backend is running on port 5000 and AI_GATEWAY_API_KEY is configured in backend/.env.',
} as const;
