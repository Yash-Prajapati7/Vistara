import { ChatModel } from '../models/chatModel.js';
import { ChatDocument, ChatTurn, ChatSummary } from '../types/database.js';
import { DiagnosticData, ImageAttachmentPayload } from '../types/pathology.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { MODEL_CONFIG } from '../constants/modelConfig.js';
import { logger } from '../utils/logger.js';

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
   * Appends a user prompt turn into the chat document, including the raw base64 image string.
   */
  public async recordUserTurn(
    sessionId: string,
    userId: string,
    prompt: string,
    image?: ImageAttachmentPayload
  ): Promise<string> {
    const turnId = `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const turn: ChatTurn = {
      [DB_CONSTANTS.FIELD_TURN_ID]: turnId,
      [DB_CONSTANTS.FIELD_PROMPT]: prompt.trim(),
      [DB_CONSTANTS.FIELD_COMPLETION]: '',
      [DB_CONSTANTS.FIELD_IMAGE_BASE64]: image?.data,
      [DB_CONSTANTS.FIELD_IMAGE_META]: image
        ? {
            [DB_CONSTANTS.FIELD_IMAGE_NAME]: image.name,
            [DB_CONSTANTS.FIELD_IMAGE_MIME_TYPE]: image.mimeType || 'image/jpeg',
          }
        : undefined,
      [DB_CONSTANTS.FIELD_TIMESTAMP]: new Date(),
    };

    // If chat title is default, propose initial title from prompt
    const initialTitle = prompt.length > 40 ? `${prompt.substring(0, 37)}...` : prompt;

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
      { upsert: true, new: true }
    );

    logger.info('Recorded user turn into MongoDB chat', {
      sessionId,
      turnId,
      hasImage: Boolean(image?.data),
    });

    return turnId;
  }

  /**
   * Records the completion, diagnostic data, and reasoning content for the active turn.
   */
  public async recordCompletion(
    sessionId: string,
    completionText: string,
    diagnosticData: DiagnosticData,
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
    chat.turns[lastTurnIndex].diagnosticData = diagnosticData;
    if (thinkingContent) {
      chat.turns[lastTurnIndex].thinkingContent = thinkingContent;
    }

    // Intelligent title derivation if title was generic
    if (diagnosticData.crop && diagnosticData.disease) {
      chat.cropType = diagnosticData.crop;
      if (
        chat.title === DB_CONSTANTS.DEFAULT_CHAT_TITLE ||
        chat.title.startsWith('Analyze ') ||
        chat.turns.length === 1
      ) {
        chat.title = `${diagnosticData.crop} ${diagnosticData.disease} Analysis`;
      }
    }

    await chat.save();
    logger.info('Persisted LLM completion and diagnostic data to MongoDB', {
      sessionId,
      crop: diagnosticData.crop,
      disease: diagnosticData.disease,
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
        [DB_CONSTANTS.PROJECTION_EXCLUDE_TURNS_THINKING]: 0,
      })
      .lean();

    return chats.map((chat) => {
      const turns = chat.turns || [];
      const lastTurn = turns[turns.length - 1];
      const previewSnippet =
        lastTurn?.completion?.substring(0, 100) ||
        lastTurn?.prompt?.substring(0, 80) ||
        '';

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
