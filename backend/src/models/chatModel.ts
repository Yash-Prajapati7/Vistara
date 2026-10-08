import mongoose, { Schema, Model } from 'mongoose';
import { ChatDocument, ChatTurn } from '../types/database.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { SERVER_STRINGS } from '../constants/serverStrings.js';

const diagnosticDataSchema = new Schema(
  {
    [DB_CONSTANTS.FIELD_DIAG_CROP]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_DISEASE]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_PATHOGEN_TYPE]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_CONFIDENCE]: { type: Number, required: true },
    [DB_CONSTANTS.FIELD_DIAG_SEVERITY]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_SYMPTOMS]: [{ type: String }],
    [DB_CONSTANTS.FIELD_DIAG_ORGANIC_TREATMENT]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_CHEMICAL_TREATMENT]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_DIAG_PREVENTATIVE_ACTION]: { type: String, required: true },
  },
  { _id: false }
);

const imageMetaSchema = new Schema(
  {
    [DB_CONSTANTS.FIELD_IMAGE_NAME]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_IMAGE_MIME_TYPE]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_IMAGE_SIZE_BYTES]: { type: Number, required: false },
  },
  { _id: false }
);

const chatTurnSchema = new Schema<ChatTurn>(
  {
    [DB_CONSTANTS.FIELD_TURN_ID]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_PROMPT]: { type: String, required: true },
    [DB_CONSTANTS.FIELD_COMPLETION]: { type: String, default: SERVER_STRINGS.EMPTY_STRING },
    [DB_CONSTANTS.FIELD_IMAGE_BASE64]: { type: String, required: false },
    [DB_CONSTANTS.FIELD_IMAGE_META]: { type: imageMetaSchema, required: false },
    [DB_CONSTANTS.FIELD_THINKING_CONTENT]: { type: String, required: false },
    [DB_CONSTANTS.FIELD_DIAGNOSTIC_DATA]: { type: diagnosticDataSchema, required: false },
    [DB_CONSTANTS.FIELD_TIMESTAMP]: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new Schema<ChatDocument>(
  {
    [DB_CONSTANTS.FIELD_SESSION_ID]: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    [DB_CONSTANTS.FIELD_USER_ID]: {
      type: String,
      required: true,
      index: true,
    },
    [DB_CONSTANTS.FIELD_TITLE]: {
      type: String,
      required: true,
      default: DB_CONSTANTS.DEFAULT_CHAT_TITLE,
    },
    [DB_CONSTANTS.FIELD_CROP_TYPE]: {
      type: String,
      required: false,
    },
    [DB_CONSTANTS.FIELD_TURNS]: [chatTurnSchema],
  },
  {
    timestamps: true,
    collection: DB_CONSTANTS.COLLECTION_CHATS,
  }
);

// Compound index for instant querying of all chats belonging to a user upon login, sorted newest first
chatSchema.index({
  [DB_CONSTANTS.FIELD_USER_ID]: DB_CONSTANTS.SORT_ASCENDING,
  [DB_CONSTANTS.FIELD_UPDATED_AT]: DB_CONSTANTS.SORT_DESCENDING,
});

export const ChatModel: Model<ChatDocument> = mongoose.model<ChatDocument>(
  DB_CONSTANTS.COLLECTION_CHATS,
  chatSchema
);
