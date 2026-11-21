/**
 * Model and inference configuration constants for Vistara backend.
 * Configured for Vercel AI Gateway and alibaba/qwen3.7-flash.
 * Open-ended to support any plant disease and pathogen classification.
 */
export const MODEL_CONFIG = {
  // Target Vision-Language Model
  DEFAULT_MODEL_ID: 'xiaomi/mimo-v2.6-flash',

  // Translation Inference Settings (Alibaba Qwen with Low Reasoning Effort)
  TRANSLATION_MODEL_ID: 'alibaba/qwen3.7-flash',
  TRANSLATION_TEMPERATURE: 0.1,
  TRANSLATION_MAX_TOKENS: 15000,
  TRANSLATION_REASONING_EFFORT: 'low',

  // Inference Hyperparameters
  TEMPERATURE: 0.2,
  TOP_P: 0.9,
  MAX_TOKENS: 15000,

  // Context Settings
  MAX_PROMPT_HISTORY_ITEMS: 20,
  DEFAULT_SESSION_PREFIX: 'conv-',

  // Fallback defaults for missing diagnostics
  DEFAULT_CONFIDENCE: 85.0,
  DEFAULT_SEVERITY: 'Moderate',
  DEFAULT_PATHOGEN_TYPE: 'Unspecified Pathogen',
} as const;
