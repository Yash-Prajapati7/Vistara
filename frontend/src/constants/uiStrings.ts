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
  DEFAULT_CASE_TITLE: 'New Pathology Case',
  MODEL_DEFAULT: 'Vistara AgriVision 2.0 (Transformer VL)',
  MODEL_BADGE: 'AGRI-VISION',

  // Actions & Buttons
  NEW_ANALYSIS: 'New Analysis',
  SEND: 'Analyze',
  SEND_MESSAGE: 'Send for pathology analysis',
  ATTACH_IMAGE: 'Upload crop or leaf photo',
  VOICE_INPUT: 'Dictate field notes',
  REMOVE_IMAGE: 'Remove photo',
  SEARCH_PLACEHOLDER: 'Search crop diagnostic sessions...',
  INPUT_PLACEHOLDER: 'Describe crop symptoms or upload a leaf photo for disease identification...',
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
  DRAG_IMAGE_ACTIVE: 'Drop crop foliage photo to analyze pathology...',
  GENERATING_RESPONSE: 'Processing leaf imagery through Transformer Vision-Language models...',
} as const;
