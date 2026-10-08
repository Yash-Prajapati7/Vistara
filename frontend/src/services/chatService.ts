import axios, { AxiosProgressEvent } from 'axios';
import { DiagnosticData, ImageAttachment } from '../types/chat';
import { UI_STRINGS } from '../constants/uiStrings';

export interface StreamCallbacks {
  onThinkingDelta?: (delta: string) => void;
  onTextDelta: (delta: string) => void;
  onDiagnosticData: (data: DiagnosticData, markdownReport: string) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export interface SendMessageParams {
  sessionId: string;
  userId?: string;
  prompt: string;
  imageAttachment?: ImageAttachment;
  modelId?: string;
  callbacks: StreamCallbacks;
}

/**
 * Service managing communication with the Vistara vision-language backend via Axios.
 * Adheres strictly to the Centralized String Constants Policy from .agents/agents.md.
 */
export class ChatService {
  /**
   * Streams a chat/diagnostic response from the backend using Axios with progress tracking.
   * Persists the user prompt and image base64 into MongoDB, and saves completion upon finish.
   */
  public async streamChatMessage({
    sessionId,
    userId = UI_STRINGS.DEFAULT_USER_ID,
    prompt,
    imageAttachment,
    modelId,
    callbacks,
  }: SendMessageParams): Promise<void> {
    let lastProcessedIndex = 0;

    const payload = {
      sessionId,
      userId,
      prompt,
      modelId,
      image: imageAttachment
        ? {
            id: imageAttachment.id,
            name: imageAttachment.name,
            data: imageAttachment.url,
            mimeType: UI_STRINGS.HTTP_MIME_JPEG,
          }
        : undefined,
    };

    try {
      await axios.post(UI_STRINGS.API_CHAT_ENDPOINT, payload, {
        headers: {
          [UI_STRINGS.HTTP_HEADER_CONTENT_TYPE]: UI_STRINGS.HTTP_MIME_JSON,
        },
        responseType: UI_STRINGS.HTTP_RESPONSE_TYPE_TEXT,
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          const xhr = progressEvent.event?.target as XMLHttpRequest | undefined;
          const currentText = xhr
            ? xhr.responseText
            : (progressEvent as unknown as { responseText?: string }).responseText || UI_STRINGS.EMPTY_STRING;

          if (!currentText || currentText.length <= lastProcessedIndex) {
            return;
          }

          const newChunk = currentText.slice(lastProcessedIndex);
          lastProcessedIndex = currentText.length;

          // Process SSE lines
          const lines = newChunk.split(UI_STRINGS.NEWLINE_SEPARATOR);
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith(UI_STRINGS.SSE_DATA_PREFIX)) {
              const jsonStr = trimmed.slice(UI_STRINGS.SSE_DATA_PREFIX.length);
              try {
                const event = JSON.parse(jsonStr);

                if (event.type === UI_STRINGS.SSE_EVENT_THINKING_DELTA && typeof event.text === UI_STRINGS.TYPEOF_STRING) {
                  callbacks.onThinkingDelta?.(event.text);
                } else if (event.type === UI_STRINGS.SSE_EVENT_TEXT_DELTA && typeof event.text === UI_STRINGS.TYPEOF_STRING) {
                  callbacks.onTextDelta(event.text);
                } else if (event.type === UI_STRINGS.SSE_EVENT_DIAGNOSTIC_DATA && event.diagnosticData) {
                  callbacks.onDiagnosticData(event.diagnosticData, event.markdownReport || UI_STRINGS.EMPTY_STRING);
                } else if (event.type === UI_STRINGS.SSE_EVENT_DONE) {
                  callbacks.onComplete();
                } else if (event.type === UI_STRINGS.SSE_EVENT_ERROR) {
                  callbacks.onError(event.error || UI_STRINGS.API_STREAM_ERROR);
                }
              } catch {
                // Incomplete JSON chunk across network boundaries; handled on subsequent chunks
              }
            }
          }
        },
      });

      callbacks.onComplete();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          UI_STRINGS.API_ERROR_NETWORK;
        callbacks.onError(errorMsg);
      } else if (error instanceof Error) {
        callbacks.onError(error.message);
      } else {
        callbacks.onError(UI_STRINGS.API_ERROR_NETWORK);
      }
    }
  }

  /**
   * Retrieves all chat conversations for a specific user from MongoDB.
   */
  public async fetchUserConversations(userId: string = UI_STRINGS.DEFAULT_USER_ID) {
    const response = await axios.get(
      `${UI_STRINGS.API_USER_CHATS_ENDPOINT}${UI_STRINGS.PATH_SEPARATOR}${userId}`
    );
    return response.data;
  }

  /**
   * Loads full dialogue history and base64 image data for a specific chat from MongoDB.
   */
  public async loadSessionHistory(sessionId: string) {
    const response = await axios.get(
      `${UI_STRINGS.API_SESSION_ENDPOINT}${UI_STRINGS.PATH_SEPARATOR}${sessionId}`
    );
    return response.data;
  }

  /**
   * Permanently deletes a chat session from MongoDB and cleans up state.
   */
  public async deleteChat(sessionId: string, userId: string = UI_STRINGS.DEFAULT_USER_ID) {
    const response = await axios.delete(
      `${UI_STRINGS.API_SESSION_ENDPOINT}${UI_STRINGS.PATH_SEPARATOR}${sessionId}`,
      {
        params: { [UI_STRINGS.QUERY_USER_ID]: userId },
      }
    );
    return response.data;
  }

  /**
   * Updates the title of a chat session in MongoDB.
   */
  public async renameChat(
    sessionId: string,
    title: string,
    userId: string = UI_STRINGS.DEFAULT_USER_ID
  ) {
    const response = await axios.patch(
      `${UI_STRINGS.API_SESSION_ENDPOINT}${UI_STRINGS.PATH_SEPARATOR}${sessionId}${UI_STRINGS.PATH_SEPARATOR}${UI_STRINGS.TITLE_SUFFIX_ENDPOINT}`,
      { title, userId }
    );
    return response.data;
  }

  /**
   * Performs a health check against the backend service.
   */
  public async checkHealth() {
    const response = await axios.get(UI_STRINGS.API_HEALTH_ENDPOINT);
    return response.data;
  }
}

export const chatService = new ChatService();
