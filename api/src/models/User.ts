import { pool } from '../config/database';
import { User, CreateUserData } from '../types';
import { hashPassword } from '../utils/auth';

/**
 * UserModel handles database operations related to users.
 * It provides methods to create, find, update user profiles,
 * and manage user authentication.
 */
export class UserModel {
  /**
   * Creates a new user in the database.
   *
   * @param userData - The data for the new user.
   * @returns The created User object.
   */
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
    `;
    
    const values = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.firstName || null,
      userData.lastName || null
    ];
    
    const result = await pool.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - The ID of the user to find.
   * @returns The User object or null if not found.
   */
  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Finds a user by their email.
   *
   * @param email - The email of the user to find.
   * @returns The User object or null if not found.
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user to find.
   * @returns The User object or null if not found.
   */
  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Finds a user by their email, including the password hash.
   *
   * @param email - The email of the user to find.
   * @returns The User object with password hash or null if not found.
   */
  static async findByEmailWithPassword(email: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      ...this.mapRowToUser(row),
      passwordHash: row.password_hash
    };
  }

  /**
   * Updates a user's profile information.
   *
   * @param id - The ID of the user to update.
   * @param updates - The fields to update in the user's profile.
   * @returns The updated User object or null if not found.
   */
  static async updateProfile(id: number, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'bio' | 'avatarUrl'>>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updates.lastName);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(updates.bio);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatarUrl);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Maps a database row to a User object.
   *
   * @param row - The database row to map.
   * @returns The User object.
   */
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      isVerified: row.is_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Follows a user
   *
   * @param followerId - The ID of the user who is following.
   * @param followingId - The ID of the user being followed.
   * @returns True if successfully followed, false if alread following.
   */

  static async followUser(followerId: number, followingId: number):  Promise<boolean> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const query = `
    INSERT INTO followers (follower_id, following_id)
    VALUES ($1, $2)
    ON CONFLICT (follower_id, following_id) DO NOTHING
    RETURNING id
    `;

    const result = await pool.query(query, [followerId, followingId]);
    return result.rows.length > 0;
  }

  /**
   * Unfollows a user
   *
   * @param followerId - The ID of the user who is following.
   * @param followingId - The ID of the user being followed.
   * @returns True if successfully followed, false if alread following.
   */

  static async unfollowUser(followerId: number, followingId: number):  Promise<boolean> {

    const query = `
    DELETE FROM followers
    WHERE follower_id = $1 AND following_id = $2
    `;

    const result = await pool.query(query, [followerId, followingId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Verify following
   *
   * @param followerId - The ID of the user who is following.
   * @param followingId - The ID of the user being followed.
   * @returns True if following, false otherwise
   */

  static async isFollowing(followerId: number, followingId: number):  Promise<boolean> {

    const query = `
    SELECT id FROM followers
    WHERE follower_id = $1 AND following_id = $2
    `;

    const result = await pool.query(query, [followerId, followingId]);
    return result.rows.length > 0;
  }

  /**
   * Gets the number of followers for a user
   *
   * @param userId - The ID of the user.
   * @returns The number of followers.
   */

  static async getFollowersCount(userId: number):  Promise<number> {

    const query = `
    SELECT COUNT(*) as count FROM followers
    WHERE following_id =$1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Gets the number of users a user is following
   *
   * @param userId - The ID of the user.
   * @returns The number of users being followed.
   */

  static async getFollowingCount(userId: number):  Promise<number> {

    const query = `
    SELECT COUNT(*) as count FROM followers
    WHERE follower_id =$1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}
