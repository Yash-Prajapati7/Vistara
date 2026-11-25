import { generateText, streamText } from 'ai';
import { VISTARA_PATHOLOGY_SYSTEM_PROMPT, buildPathologyUserPrompt } from '../prompts/leafAnalysis.prompt.js';
import { VISTARA_VIDEO_PATHOLOGY_SYSTEM_PROMPT, buildVideoPathologyUserPrompt } from '../prompts/videoAnalysis.prompt.js';
import { VISTARA_TRANSLATION_SYSTEM_PROMPT, buildTranslationUserPrompt } from '../prompts/translation.prompt.js';
import { TITLE_GENERATION_SYSTEM_PROMPT, buildTitleUserPrompt } from '../prompts/titleGeneration.prompt.js';
import { contextService } from './contextService.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { ImageAttachmentPayload, VideoAttachmentPayload } from '../types/pathology.js';
import { logger } from '../utils/logger.js';

export interface PathologyStreamRequest {
  sessionId: string;
  currentPrompt: string;
  responseLanguage?: string;
  image?: ImageAttachmentPayload;
  video?: VideoAttachmentPayload;
  modelId?: string;
  abortSignal?: AbortSignal;
}

export interface TranslationStreamRequest {
  content: string;
  targetLanguage: string;
  abortSignal?: AbortSignal;
}

/**
 * Invokes the Vercel AI SDK.
 * Supports image and native video input with specialized video pathology prompts.
 * Injects prompt history array and last model response for context understanding.
 */
export async function streamPathologyDiagnosis({
  sessionId,
  currentPrompt,
  responseLanguage,
  image,
  video,
  modelId,
  abortSignal,
}: PathologyStreamRequest) {
  const targetModel = modelId || process.env.AI_MODEL_ID || MODEL_CONFIG.DEFAULT_MODEL_ID;

  // Retrieve prior prompts array and last model response from session context
  const storedPrompts = contextService.getStoredPrompts(sessionId);
  const lastModelResponse = contextService.getLastModelResponse(sessionId);

  const hasVideo = Boolean(video?.data || video?.url);
  const hasImage = Boolean(image?.data || image?.url);

  logger.info('Initiating vision-language diagnostic stream', {
    sessionId,
    targetModel,
    responseLanguage: responseLanguage || SERVER_STRINGS.DEFAULT_RESPONSE_LANGUAGE,
    priorPromptsCount: storedPrompts.length,
    hasLastResponse: Boolean(lastModelResponse),
    hasImage,
    hasVideo,
  });

  // Construct context-enriched user prompt selecting dedicated prompt for video vs image
  const composedPrompt = hasVideo
    ? buildVideoPathologyUserPrompt(currentPrompt, storedPrompts, lastModelResponse, true, responseLanguage)
    : buildPathologyUserPrompt(currentPrompt, storedPrompts, lastModelResponse, hasImage, responseLanguage);

  // Store the current prompt into the session's prompt array
  contextService.recordUserPrompt(sessionId, currentPrompt, hasImage || hasVideo);

  // Build multimodal content parts
  type UserContentPart =
    | { type: typeof SERVER_STRINGS.CONTENT_TYPE_TEXT; text: string }
    | { type: typeof SERVER_STRINGS.CONTENT_TYPE_IMAGE; image: string | URL }
    | { type: typeof SERVER_STRINGS.CONTENT_TYPE_FILE; data: Buffer; mediaType: string };

  const userContent: UserContentPart[] = [
    {
      type: SERVER_STRINGS.CONTENT_TYPE_TEXT,
      text: composedPrompt,
    },
  ];

  // Attach video specimen if provided (native buffer parts supported by mimo-v2.6-flash)
  if (video?.data) {
    const cleanBase64 = video.data.replace(
      SERVER_STRINGS.BASE64_DATA_URL_PREFIX_REGEX,
      SERVER_STRINGS.EMPTY_STRING
    );
    const videoBuffer = Buffer.from(cleanBase64, SERVER_STRINGS.BASE64_ENCODING);
    userContent.push({
      type: SERVER_STRINGS.CONTENT_TYPE_FILE,
      data: videoBuffer,
      mediaType: video.mimeType || SERVER_STRINGS.MEDIA_TYPE_VIDEO_MP4,
    });
  } else if (image) {
    // Attach leaf image if provided
    const imagePayload = image.data || image.url;
    if (imagePayload) {
      userContent.push({
        type: SERVER_STRINGS.CONTENT_TYPE_IMAGE,
        image: imagePayload,
      });
    }
  }

  // System prompt selection: dedicated video pathology prompt when video is present
  const systemPrompt = hasVideo
    ? VISTARA_VIDEO_PATHOLOGY_SYSTEM_PROMPT
    : VISTARA_PATHOLOGY_SYSTEM_PROMPT;

  const streamResult = streamText({
    model: targetModel,
    system: systemPrompt,
    messages: [
      {
        role: SERVER_STRINGS.ROLE_USER,
        content: userContent as unknown as string,
      },
    ],
    temperature: MODEL_CONFIG.TEMPERATURE,
    maxOutputTokens: MODEL_CONFIG.MAX_TOKENS,
    abortSignal,
  });

  return streamResult;
}

/**
 * Streams multilingual translation targeting alibaba/qwen3.7-flash with low reasoning effort.
 * Preserves Markdown report structure and trailing DiagnosticData JSON schema.
 */
export async function streamPathologyTranslation({
  content,
  targetLanguage,
  abortSignal,
}: TranslationStreamRequest) {
  const targetModel = MODEL_CONFIG.TRANSLATION_MODEL_ID;

  logger.info('Initiating multilingual diagnostic translation stream', {
    targetModel,
    targetLanguage,
    contentLength: content.length,
  });

  const prompt = buildTranslationUserPrompt(content, targetLanguage);

  const streamResult = streamText({
    model: targetModel,
    system: VISTARA_TRANSLATION_SYSTEM_PROMPT,
    messages: [
      {
        role: SERVER_STRINGS.ROLE_USER,
        content: prompt,
      },
    ],
    temperature: MODEL_CONFIG.TRANSLATION_TEMPERATURE,
    maxOutputTokens: MODEL_CONFIG.TRANSLATION_MAX_TOKENS,
    [SERVER_STRINGS.REASONING_OPTION_KEY]: MODEL_CONFIG.TRANSLATION_REASONING_EFFORT,
    abortSignal,
  });

  return streamResult;
}

export interface GenerateTitleOptions {
  prompt: string;
  hasImage?: boolean;
  hasVideo?: boolean;
}

/**
 * Generates a concise, natural conversation title using inclusionai/ling-3.0-flash.
 * Sets reasoning effort to none for fast, non-streaming completion.
 */
export async function generateConversationTitle({
  prompt,
  hasImage,
  hasVideo,
}: GenerateTitleOptions): Promise<string> {
  const targetModel = MODEL_CONFIG.TITLE_GENERATION_MODEL_ID;

  if (!prompt.trim()) {
    if (hasVideo) return 'Field Video Scan';
    if (hasImage) return 'Crop Specimen Photo';
    return SERVER_STRINGS.DEFAULT_CHAT_TITLE_FALLBACK;
  }

  const contextDescription = buildTitleUserPrompt(prompt, hasImage, hasVideo);

  logger.info('Generating conversation title', {
    targetModel,
    reasoning: MODEL_CONFIG.TITLE_REASONING_EFFORT,
    promptPreview: contextDescription.slice(0, 60),
  });

  const { text } = await generateText({
    model: targetModel,
    system: TITLE_GENERATION_SYSTEM_PROMPT,
    messages: [
      {
        role: SERVER_STRINGS.ROLE_USER,
        content: contextDescription,
      },
    ],
    temperature: MODEL_CONFIG.TITLE_TEMPERATURE,
    maxOutputTokens: MODEL_CONFIG.TITLE_MAX_TOKENS,
    [SERVER_STRINGS.REASONING_OPTION_KEY]: MODEL_CONFIG.TITLE_REASONING_EFFORT,
  });

  const sanitized = text
    .replace(/["'`]/g, SERVER_STRINGS.EMPTY_STRING)
    .replace(/^Title:\s*/i, SERVER_STRINGS.EMPTY_STRING)
    .trim();

  return sanitized || SERVER_STRINGS.DEFAULT_CHAT_TITLE_FALLBACK;
}
