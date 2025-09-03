import { pool } from "../config/database";
import { Post, CreatePostData, User } from "../types";

/**
 * PostModel handles database operations related to posts.
 * It provides methods to create, find, update, delete posts,
 * and manage likes and comments.
 */
export class PostModel {
  /**
   * Creates a new post in the database.
   *
   * @param userId - The ID of the user creating the post.
   * @param postData - The data for the new post.
   * @returns The created Post object.
   */
  static async create(userId: number, postData: CreatePostData): Promise<Post> {
    const query = `
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, content, image_url, likes_count, hates_count, comments_count, created_at, updated_at
    `;

    const values = [userId, postData.content, postData.imageUrl || null];
    const result = await pool.query(query, values);
    return this.mapRowToPost(result.rows[0]);
  }

  /**
   * Finds a post by its ID, including user information.
   *
   * @param id - The ID of the post to find.
   * @returns The Post object with user information or null if not found.
   */
  static async findById(id: number): Promise<Post | null> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.hates_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPostWithUser(result.rows[0]) : null;
  }

  /**
   * Finds posts by user ID, including user information.
   *
   * @param userId - The ID of the user whose posts to find.
   * @param limit - The maximum number of posts to return.
   * @param offset - The offset for pagination.
   * @returns An array of Post objects with user information.
   */
  static async findByUserId(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.hates_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map((row) => this.mapRowToPostWithUser(row));
  }

  /**
   * Gets the timeline for a user, including posts from followed users.
   *
   * @param userId - The ID of the user whose timeline to retrieve.
   * @param limit - The maximum number of posts to return.
   * @param offset - The offset for pagination.
   * @returns An array of Post objects with user information.
   */
  static async getTimeline(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.hates_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 OR p.user_id IN (
        SELECT following_id FROM followers WHERE follower_id = $1
      )
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map((row) => this.mapRowToPostWithUser(row));
  }

  /**
   * Gets posts from all users randomly.
   *
   * @param limit - The maximum number of posts to return.
   * @param offset - The offset for pagination.
   * @returns An array of Post objects with user information from all users.
   */
  static async getAllPostsRandom(
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.hates_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY RANDOM()
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row) => this.mapRowToPostWithUser(row));
  }

  /**
   * Updates a post's content.
   *
   * @param id - The ID of the post to update.
   * @param userId - The ID of the user updating the post.
   * @param content - The new content for the post.
   * @returns The updated Post object or null if not found.
   */
  static async update(
    id: number,
    userId: number,
    content: string,
  ): Promise<Post | null> {
    const query = `
      UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, user_id, content, image_url, likes_count, hates_count, comments_count, created_at, updated_at
    `;

    const result = await pool.query(query, [content, id, userId]);
    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null;
  }

  /**
   * Deletes a post.
   *
   * @param id - The ID of the post to delete.
   * @param userId - The ID of the user deleting the post.
   * @returns True if the post was deleted, false otherwise.
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const query = `DELETE FROM posts WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, userId]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Toggles a like on a post.
   *
   * @param postId - The ID of the post to like/unlike.
   * @param userId - The ID of the user liking/unliking the post.
   * @returns An object containing whether the post is liked and the updated likes count.
   */
  static async toggleLike(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const checkQuery = `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`;
      const existing = await client.query(checkQuery, [postId, userId]);

      let liked: boolean;

      if (existing.rows.length > 0) {
        await client.query(
          `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
          [postId, userId],
        );
        await client.query(
          `UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1`,
          [postId],
        );
        liked = false;
      } else {
        await client.query(
          `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
          [postId, userId],
        );
        await client.query(
          `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`,
          [postId],
        );
        liked = true;
      }

      const countQuery = `SELECT likes_count FROM posts WHERE id = $1`;
      const countResult = await client.query(countQuery, [postId]);

      await client.query("COMMIT");

      return {
        liked,
        likesCount: countResult.rows[0].likes_count,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async toggleHate(
    postId: number,
    userId: number,
  ): Promise<{ hated: boolean; hatesCount: number }> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const checkQuery = `SELECT id FROM hates WHERE post_id = $1 AND user_id = $2`;
      const existing = await client.query(checkQuery, [postId, userId]);

      let hated: boolean;

      if (existing.rows.length > 0) {
        await client.query(
          `DELETE FROM hates WHERE post_id = $1 AND user_id = $2`,
          [postId, userId],
        );
        await client.query(
          `UPDATE posts SET hates_count = hates_count - 1 WHERE id = $1`,
          [postId],
        );
        hated = false;
      } else {
        await client.query(
          `INSERT INTO hates (post_id, user_id) VALUES ($1, $2)`,
          [postId, userId],
        );
        await client.query(
          `UPDATE posts SET hates_count = hates_count + 1 WHERE id = $1`,
          [postId],
        );
        hated = true;
      }

      const countQuery = `SELECT hates_count FROM posts WHERE id = $1`;
      const countResult = await client.query(countQuery, [postId]);

      await client.query("COMMIT");

      return {
        hated,
        hatesCount: countResult.rows[0].hates_count,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Maps a database row to a Post object.
   *
   * @param row - The database row to map.
   * @returns The Post object.
   */
  private static mapRowToPost(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      hatesCount: row.hates_count,
      commentsCount: row.comments_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Maps a database row to a Post object with user information.
   *
   * @param row - The database row to map.
   * @returns The Post object with user information.
   */
  private static mapRowToPostWithUser(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      hatesCount: row.hates_count,
      commentsCount: row.comments_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        email: "",
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        isVerified: row.is_verified,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }
}
