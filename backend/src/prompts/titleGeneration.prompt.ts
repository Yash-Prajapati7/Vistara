/**
 * System and user prompt builders for AI-powered conversation title generation.
 * Target model: inclusionai/ling-3.0-flash with zero reasoning effort.
 * Strictly zero emojis.
 */
export const TITLE_GENERATION_SYSTEM_PROMPT = `You are a conversation title generator. Output a concise, natural 3-to-6 word title in Title Case capturing the user's inquiry, topic, or intent. Avoid forcing rigid domain buzzwords unless asked. Output ONLY the plain title without quotes, punctuation, or preamble.`;

/**
 * Constructs user prompt description for title generation including optional media flags.
 */
export function buildTitleUserPrompt(
  prompt: string,
  hasImage?: boolean,
  hasVideo?: boolean
): string {
  let contextDescription = prompt.trim();
  if (!contextDescription) {
    if (hasVideo) return 'Field Video Scan';
    if (hasImage) return 'Crop Specimen Photo';
    return 'New Conversation';
  }

  if (hasImage) {
    contextDescription += ' (Photo attached)';
  } else if (hasVideo) {
    contextDescription += ' (Video attached)';
  }

  return contextDescription;
}
