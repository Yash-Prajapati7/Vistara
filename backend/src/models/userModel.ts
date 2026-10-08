import mongoose, { Schema, Model } from 'mongoose';
import { User } from '../types/database.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';

const userSchema = new Schema<User>(
  {
    [DB_CONSTANTS.FIELD_USER_ID]: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    [DB_CONSTANTS.FIELD_NAME]: {
      type: String,
      required: true,
      trim: true,
    },
    [DB_CONSTANTS.FIELD_EMAIL]: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    [DB_CONSTANTS.FIELD_INITIALS]: {
      type: String,
      required: true,
      trim: true,
    },
    [DB_CONSTANTS.FIELD_AVATAR_URL]: {
      type: String,
      required: false,
    },
    [DB_CONSTANTS.FIELD_TIER]: {
      type: String,
      enum: ['RESEARCH PRO', 'FIELD ADVISOR', 'STANDARD'],
      default: DB_CONSTANTS.DEFAULT_USER_TIER,
    },
    [DB_CONSTANTS.FIELD_SCANS_REMAINING]: {
      type: String,
      default: DB_CONSTANTS.DEFAULT_SCANS_REMAINING,
    },
  },
  {
    timestamps: true,
    collection: DB_CONSTANTS.COLLECTION_USERS,
  }
);

export const UserModel: Model<User> = mongoose.model<User>(
  DB_CONSTANTS.COLLECTION_USERS,
  userSchema
);
