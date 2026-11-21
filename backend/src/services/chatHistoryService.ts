import { ChatModel } from '../models/chatModel.js';
import { ChatDocument, ChatTurn, ChatSummary } from '../types/database.js';
import { DiagnosticData, ImageAttachmentPayload, VideoAttachmentPayload } from '../types/pathology.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { SERVER_STRINGS } from '../constants/serverStrings.js';
import { logger } from '../utils/logger.js';

/**
 * Intelligently derives a clean, context-appropriate title for a chat session.
 * Conversational inquiries (greetings, identity questions) receive "General Consultation".
 * Video scans receive "Field Video Diagnostic Scan".
 * Photo uploads start as "Leaf Specimen Scan" until diagnosed.
 */
export function deriveChatTitle(prompt: string, hasImage: boolean, hasVideo: boolean = false): string {
  if (hasVideo) {
    return DB_CONSTANTS.TITLE_FIELD_VIDEO_SCAN;
  }

  if (hasImage) {
    return DB_CONSTANTS.TITLE_LEAF_SPECIMEN_SCAN;
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return DB_CONSTANTS.DEFAULT_CHAT_TITLE;
  }

  const GREETING_REGEX = /^(hi|hello|hey|good\s+(morning|afternoon|evening|day)|greetings|howdy|what'?s\s+up|yo)\b/i;
  const IDENTITY_REGEX = /^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|tell\s+me\s+about\s+yourself|help|introduce\s+yourself|how\s+are\s+you)\b/i;

  if (GREETING_REGEX.test(trimmed) || IDENTITY_REGEX.test(trimmed)) {
    return DB_CONSTANTS.TITLE_GENERAL_CONSULTATION;
  }

  const cleanPrompt = trimmed
    .replace(/^(can\s+you\s+(help\s+me\s+with|tell\s+me\s+about|explain)|please\s+tell\s+me\s+about|what\s+is\s+the|what\s+are\s+the|how\s+to|how\s+do\s+i)\s+/i, SERVER_STRINGS.EMPTY_STRING)
    .replace(/[?.!,;:]+$/, SERVER_STRINGS.EMPTY_STRING)
    .trim();

  if (cleanPrompt.length < 3) {
    return DB_CONSTANTS.TITLE_AGRONOMIC_CONSULTATION;
  }

  const titleCased = cleanPrompt
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return titleCased.length > 36 ? `${titleCased.substring(0, 33)}...` : titleCased;
}

export class ChatHistoryService {
  /**
   * Retrieves an existing chat document or creates a new one.
   */
  public async getOrCreateChat(sessionId: string, userId: string): Promise<ChatDocument> {
    let chat = await ChatModel.findOne({
      [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId,
    });

    if (!chat) {
      chat = await ChatModel.create({
        [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId,
        [DB_CONSTANTS.FIELD_USER_ID]: userId,
        [DB_CONSTANTS.FIELD_TITLE]: DB_CONSTANTS.DEFAULT_CHAT_TITLE,
        [DB_CONSTANTS.FIELD_TURNS]: [],
      });
      logger.info('Created new chat document in MongoDB', { sessionId, userId });
    }

    return chat.toObject<ChatDocument>();
  }

  /**
   * Appends a user prompt turn into the chat document, including the raw base64 image/video string.
   */
  public async recordUserTurn(
    sessionId: string,
    userId: string,
    prompt: string,
    image?: ImageAttachmentPayload,
    video?: VideoAttachmentPayload
  ): Promise<string> {
    const turnId = `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const turn: ChatTurn = {
      [DB_CONSTANTS.FIELD_TURN_ID]: turnId,
      [DB_CONSTANTS.FIELD_PROMPT]: prompt.trim(),
      [DB_CONSTANTS.FIELD_COMPLETION]: SERVER_STRINGS.EMPTY_STRING,
      [DB_CONSTANTS.FIELD_IMAGE_BASE64]: image?.data,
      [DB_CONSTANTS.FIELD_IMAGE_META]: image
        ? {
            [DB_CONSTANTS.FIELD_IMAGE_NAME]: image.name,
            [DB_CONSTANTS.FIELD_IMAGE_MIME_TYPE]: image.mimeType || 'image/jpeg',
          }
        : undefined,
      [DB_CONSTANTS.FIELD_VIDEO_BASE64]: video?.data,
      [DB_CONSTANTS.FIELD_VIDEO_META]: video
        ? {
            [DB_CONSTANTS.FIELD_VIDEO_NAME]: video.name,
            [DB_CONSTANTS.FIELD_VIDEO_MIME_TYPE]: video.mimeType || 'video/mp4',
            [DB_CONSTANTS.FIELD_VIDEO_SIZE_BYTES]: video.sizeBytes,
            [DB_CONSTANTS.FIELD_VIDEO_DURATION]: video.durationSeconds,
          }
        : undefined,
      [DB_CONSTANTS.FIELD_TIMESTAMP]: new Date(),
    };

    // Intelligently derive title for new session based on prompt and specimen presence
    const initialTitle = deriveChatTitle(prompt, Boolean(image?.data), Boolean(video?.data));

    await ChatModel.findOneAndUpdate(
      { [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId },
      {
        $setOnInsert: {
          [DB_CONSTANTS.FIELD_USER_ID]: userId,
          [DB_CONSTANTS.FIELD_TITLE]: initialTitle || DB_CONSTANTS.DEFAULT_CHAT_TITLE,
        },
        $push: {
          [DB_CONSTANTS.FIELD_TURNS]: turn,
        },
      },
      { upsert: true, returnDocument: DB_CONSTANTS.RETURN_DOCUMENT_AFTER }
    );

    logger.info('Recorded user turn into MongoDB chat', {
      sessionId,
      turnId,
      hasImage: Boolean(image?.data),
      hasVideo: Boolean(video?.data),
    });

    return turnId;
  }

  /**
   * Records the completion, diagnostic data, and reasoning content for the active turn.
   */
  public async recordCompletion(
    sessionId: string,
    completionText: string,
    diagnosticData?: DiagnosticData | null,
    thinkingContent?: string
  ): Promise<void> {
    const chat = await ChatModel.findOne({ [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId });
    if (!chat || chat.turns.length === 0) {
      logger.warn('Cannot record completion: chat session or turns not found', { sessionId });
      return;
    }

    // Update the last turn with the LLM completion
    const lastTurnIndex = chat.turns.length - 1;
    chat.turns[lastTurnIndex].completion = completionText;
    if (diagnosticData) {
      chat.turns[lastTurnIndex].diagnosticData = diagnosticData;
    }
    if (thinkingContent) {
      chat.turns[lastTurnIndex].thinkingContent = thinkingContent;
    }

    // Intelligent title derivation if title was generic
    if (diagnosticData?.crop && diagnosticData?.disease) {
      chat.cropType = diagnosticData.crop;
      if (
        chat.title === DB_CONSTANTS.DEFAULT_CHAT_TITLE ||
        chat.title === DB_CONSTANTS.TITLE_GENERAL_CONSULTATION ||
        chat.title === DB_CONSTANTS.TITLE_LEAF_SPECIMEN_SCAN ||
        chat.title.startsWith('Analyze ') ||
        chat.turns.length === 1
      ) {
        chat.title = `${diagnosticData.crop} ${diagnosticData.disease} Analysis`;
      }
    }

    await chat.save();
    logger.info('Persisted LLM completion to MongoDB', {
      sessionId,
      hasDiagnosticData: Boolean(diagnosticData),
      crop: diagnosticData?.crop,
      disease: diagnosticData?.disease,
      title: chat.title,
    });
  }

  /**
   * Queries all chats for a given user, sorted newest first.
   * Excludes heavy base64 strings and thinking deltas for fast listing.
   */
  public async getUserChats(userId: string): Promise<ChatSummary[]> {
    const chats = await ChatModel.find({
      [DB_CONSTANTS.FIELD_USER_ID]: userId,
    })
      .sort({ [DB_CONSTANTS.FIELD_UPDATED_AT]: DB_CONSTANTS.SORT_DESCENDING })
      .select({
        [DB_CONSTANTS.PROJECTION_EXCLUDE_TURNS_IMAGE]: 0,
        [DB_CONSTANTS.PROJECTION_EXCLUDE_TURNS_VIDEO]: 0,
        [DB_CONSTANTS.PROJECTION_EXCLUDE_TURNS_THINKING]: 0,
      })
      .lean();

    return chats.map((chat) => {
      const turns = chat.turns || [];
      const lastTurn = turns[turns.length - 1];
      const previewSnippet =
        lastTurn?.completion?.substring(0, 100) ||
        lastTurn?.prompt?.substring(0, 80) ||
        SERVER_STRINGS.EMPTY_STRING;

      return {
        sessionId: chat.sessionId,
        userId: chat.userId,
        title: chat.title,
        cropType: chat.cropType,
        updatedAt: chat.updatedAt ? new Date(chat.updatedAt).toISOString() : new Date().toISOString(),
        previewSnippet: previewSnippet.replace(/[\r\n]+/g, ' ').trim(),
        turnCount: turns.length,
      };
    });
  }

  /**
   * Retrieves the full chat document including all turns and base64 images.
   */
  public async getFullSession(sessionId: string, userId?: string): Promise<ChatDocument | null> {
    const query: Record<string, unknown> = {
      [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId,
    };
    if (userId) {
      query[DB_CONSTANTS.FIELD_USER_ID] = userId;
    }
    return ChatModel.findOne(query).lean<ChatDocument>();
  }

  /**
   * Permanently deletes a chat document from MongoDB.
   */
  public async deleteSession(sessionId: string, userId?: string): Promise<boolean> {
    const query: Record<string, unknown> = {
      [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId,
    };
    if (userId) {
      query[DB_CONSTANTS.FIELD_USER_ID] = userId;
    }

    const result = await ChatModel.deleteOne(query);
    const deleted = (result.deletedCount || 0) > 0;
    if (deleted) {
      logger.info('Deleted chat session from MongoDB', { sessionId, userId });
    }
    return deleted;
  }

  /**
   * Renames a chat session title.
   */
  public async updateChatTitle(
    sessionId: string,
    userId: string | undefined,
    newTitle: string
  ): Promise<boolean> {
    const query: Record<string, unknown> = {
      [DB_CONSTANTS.FIELD_SESSION_ID]: sessionId,
    };
    if (userId) {
      query[DB_CONSTANTS.FIELD_USER_ID] = userId;
    }

    const result = await ChatModel.updateOne(query, {
      $set: { [DB_CONSTANTS.FIELD_TITLE]: newTitle.trim() },
    });

    return (result.modifiedCount || 0) > 0;
  }
}

export const chatHistoryService = new ChatHistoryService();
