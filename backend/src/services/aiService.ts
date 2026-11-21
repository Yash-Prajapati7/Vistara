import { streamText } from 'ai';
import { VISTARA_PATHOLOGY_SYSTEM_PROMPT, buildPathologyUserPrompt } from '../prompts/leafAnalysis.prompt.js';
import { VISTARA_VIDEO_PATHOLOGY_SYSTEM_PROMPT, buildVideoPathologyUserPrompt } from '../prompts/videoAnalysis.prompt.js';
import { VISTARA_TRANSLATION_SYSTEM_PROMPT, buildTranslationUserPrompt } from '../prompts/translation.prompt.js';
import { contextService } from './contextService.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { ImageAttachmentPayload, VideoAttachmentPayload } from '../types/pathology.js';
import { logger } from '../utils/logger.js';

export interface PathologyStreamRequest {
  sessionId: string;
  currentPrompt: string;
  image?: ImageAttachmentPayload;
  video?: VideoAttachmentPayload;
  modelId?: string;
}

export interface TranslationStreamRequest {
  content: string;
  targetLanguage: string;
  modelId?: string;
}

/**
 * Invokes the Vercel AI SDK with xiaomi/mimo-v2.6-flash via Vercel AI Gateway.
 * Supports image and native video input with specialized video pathology prompts.
 * Injects prompt history array and last model response for context understanding.
 */
export async function streamPathologyDiagnosis({
  sessionId,
  currentPrompt,
  image,
  video,
  modelId,
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
    priorPromptsCount: storedPrompts.length,
    hasLastResponse: Boolean(lastModelResponse),
    hasImage,
    hasVideo,
  });

  // Construct context-enriched user prompt selecting dedicated prompt for video vs image
  const composedPrompt = hasVideo
    ? buildVideoPathologyUserPrompt(currentPrompt, storedPrompts, lastModelResponse, true)
    : buildPathologyUserPrompt(currentPrompt, storedPrompts, lastModelResponse, hasImage);

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

  // Invoke Vercel AI SDK streamText targeting Vercel AI Gateway
  const streamResult = streamText({
    // Type assertion allows dynamic model identifiers supported by Vercel AI Gateway
    model: targetModel as unknown as Parameters<typeof streamText>[0]['model'],
    system: systemPrompt,
    messages: [
      {
        role: SERVER_STRINGS.ROLE_USER,
        content: userContent as unknown as string,
      },
    ],
    temperature: MODEL_CONFIG.TEMPERATURE,
    maxOutputTokens: MODEL_CONFIG.MAX_TOKENS,
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
  modelId,
}: TranslationStreamRequest) {
  const targetModel = modelId || MODEL_CONFIG.TRANSLATION_MODEL_ID;

  logger.info('Initiating multilingual diagnostic translation stream', {
    targetModel,
    targetLanguage,
    contentLength: content.length,
  });

  const prompt = buildTranslationUserPrompt(content, targetLanguage);

  const streamResult = streamText({
    model: targetModel as unknown as Parameters<typeof streamText>[0]['model'],
    system: VISTARA_TRANSLATION_SYSTEM_PROMPT,
    messages: [
      {
        role: SERVER_STRINGS.ROLE_USER,
        content: prompt,
      },
    ],
    temperature: MODEL_CONFIG.TRANSLATION_TEMPERATURE,
    maxOutputTokens: MODEL_CONFIG.TRANSLATION_MAX_TOKENS,
    providerOptions: {
      [SERVER_STRINGS.GATEWAY_OPTION_KEY]: {
        [SERVER_STRINGS.REASONING_OPTION_KEY]: MODEL_CONFIG.TRANSLATION_REASONING_EFFORT,
      },
    },
  });

  return streamResult;
}
