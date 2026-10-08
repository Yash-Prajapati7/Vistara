import { UserModel } from '../models/userModel.js';
import { User } from '../types/database.js';
import { DB_CONSTANTS } from '../constants/dbConstants.js';
import { logger } from '../utils/logger.js';

export class UserService {
  /**
   * Retrieves an existing user or creates a default agronomist profile.
   */
  public async getOrCreateUser(userId: string, profileData?: Partial<User>): Promise<User> {
    const existing = await UserModel.findOne({ [DB_CONSTANTS.FIELD_USER_ID]: userId }).lean<User>();
    if (existing) {
      return existing;
    }

    const newUser: Partial<User> = {
      [DB_CONSTANTS.FIELD_USER_ID]: userId,
      [DB_CONSTANTS.FIELD_NAME]: profileData?.name || DB_CONSTANTS.DEFAULT_USER_NAME,
      [DB_CONSTANTS.FIELD_EMAIL]: profileData?.email || DB_CONSTANTS.DEFAULT_USER_EMAIL,
      [DB_CONSTANTS.FIELD_INITIALS]: profileData?.initials || DB_CONSTANTS.DEFAULT_USER_INITIALS,
      [DB_CONSTANTS.FIELD_AVATAR_URL]: profileData?.avatarUrl,
      [DB_CONSTANTS.FIELD_TIER]: profileData?.tier || DB_CONSTANTS.DEFAULT_USER_TIER,
      [DB_CONSTANTS.FIELD_SCANS_REMAINING]: profileData?.scansRemaining || DB_CONSTANTS.DEFAULT_SCANS_REMAINING,
    };

    const created = await UserModel.create(newUser);
    logger.info('Created new agronomist profile in MongoDB', { userId });
    return created.toObject<User>();
  }

  /**
   * Finds a user by their unique userId identifier.
   */
  public async getUserById(userId: string): Promise<User | null> {
    return UserModel.findOne({ [DB_CONSTANTS.FIELD_USER_ID]: userId }).lean<User>();
  }
}

export const userService = new UserService();
