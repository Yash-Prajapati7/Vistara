/**
 * Model and inference configuration constants for Vistara backend.
 */
export const MODEL_CONFIG = {
  // Target Vision-Language Model
  DEFAULT_MODEL_ID: 'xiaomi/mimo-v2.6-flash',

  // Translation Inference Settings (Alibaba Qwen with Low Reasoning Effort)
  TRANSLATION_MODEL_ID: 'alibaba/qwen3.7-flash',
  TRANSLATION_TEMPERATURE: 0.1,
  TRANSLATION_MAX_TOKENS: 15000,
  TRANSLATION_REASONING_EFFORT: 'low',

  // Title Generation Model Settings (InclusionAI Ling with Zero Reasoning)
  TITLE_GENERATION_MODEL_ID: 'inclusionai/ling-3.0-flash',
  TITLE_TEMPERATURE: 0.3,
  TITLE_MAX_TOKENS: 100,
  TITLE_REASONING_EFFORT: 'none',

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

export const ALLOWED_MODEL_IDS = [
  MODEL_CONFIG.DEFAULT_MODEL_ID,
  MODEL_CONFIG.TRANSLATION_MODEL_ID,
  MODEL_CONFIG.TITLE_GENERATION_MODEL_ID,
] as const;

export type SupportedModelId = (typeof ALLOWED_MODEL_IDS)[number];
