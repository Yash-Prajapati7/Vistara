import { streamText } from 'ai';
import { VISTARA_PATHOLOGY_SYSTEM_PROMPT, buildPathologyUserPrompt } from '../prompts/leafAnalysis.prompt.js';
import { contextService } from './contextService.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { ImageAttachmentPayload } from '../types/pathology.js';
import { logger } from '../utils/logger.js';

export interface PathologyStreamRequest {
  sessionId: string;
  currentPrompt: string;
  image?: ImageAttachmentPayload;
  modelId?: string;
}

/**
 * Invokes the Vercel AI SDK with alibaba/qwen3.7-flash via Vercel AI Gateway.
 * Injects prompt history array and last model response for context understanding.
 */
export async function streamPathologyDiagnosis({
  sessionId,
  currentPrompt,
  image,
  modelId,
}: PathologyStreamRequest) {
  const targetModel = modelId || process.env.AI_MODEL_ID || MODEL_CONFIG.DEFAULT_MODEL_ID;

  // Retrieve prior prompts array and last model response from session context
  const storedPrompts = contextService.getStoredPrompts(sessionId);
  const lastModelResponse = contextService.getLastModelResponse(sessionId);

  logger.info('Initiating vision-language diagnostic stream', {
    sessionId,
    targetModel,
    priorPromptsCount: storedPrompts.length,
    hasLastResponse: Boolean(lastModelResponse),
    hasImage: Boolean(image?.data || image?.url),
  });

  // Construct context-enriched user prompt incorporating prompt array + last model response
  const composedPrompt = buildPathologyUserPrompt(
    currentPrompt,
    storedPrompts,
    lastModelResponse,
    Boolean(image?.data || image?.url)
  );

  // Store the current prompt into the session's prompt array
  contextService.recordUserPrompt(sessionId, currentPrompt, Boolean(image?.data || image?.url));

  // Build multimodal content parts
  type UserContentPart =
    | { type: typeof SERVER_STRINGS.CONTENT_TYPE_TEXT; text: string }
    | { type: typeof SERVER_STRINGS.CONTENT_TYPE_IMAGE; image: string | URL };

  const userContent: UserContentPart[] = [
    {
      type: SERVER_STRINGS.CONTENT_TYPE_TEXT,
      text: composedPrompt,
    },
  ];

  // Attach leaf image if provided
  if (image) {
    const imagePayload = image.data || image.url;
    if (imagePayload) {
      userContent.push({
        type: SERVER_STRINGS.CONTENT_TYPE_IMAGE,
        image: imagePayload,
      });
    }
  }

  // Invoke Vercel AI SDK streamText targeting Vercel AI Gateway
  const streamResult = streamText({
    // Type assertion allows dynamic model identifiers supported by Vercel AI Gateway
    model: targetModel as unknown as Parameters<typeof streamText>[0]['model'],
    system: VISTARA_PATHOLOGY_SYSTEM_PROMPT,
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
