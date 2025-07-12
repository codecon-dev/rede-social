import { pool } from '../config/database';
import { Post, CreatePostData, User } from '../types';

export class PostModel {
  static async create(userId: number, postData: CreatePostData): Promise<Post> {
    const query = `
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, content, image_url, likes_count, comments_count, created_at, updated_at
    `;
    
    const values = [userId, postData.content, postData.imageUrl || null];
    const result = await pool.query(query, values);
    return this.mapRowToPost(result.rows[0]);
  }

  static async findById(id: number): Promise<Post | null> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPostWithUser(result.rows[0]) : null;
  }

  static async findByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.is_verified
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(row => this.mapRowToPostWithUser(row));
  }

  static async getTimeline(userId: number, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.created_at, p.updated_at,
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
    return result.rows.map(row => this.mapRowToPostWithUser(row));
  }

  static async update(id: number, userId: number, content: string): Promise<Post | null> {
    const query = `
      UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, user_id, content, image_url, likes_count, comments_count, created_at, updated_at
    `;
    
    const result = await pool.query(query, [content, id, userId]);
    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const query = `DELETE FROM posts WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, userId]);
    return result.rowCount > 0;
  }

  static async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likesCount: number }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const checkQuery = `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`;
      const existing = await client.query(checkQuery, [postId, userId]);
      
      let liked: boolean;
      
      if (existing.rows.length > 0) {
        await client.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
        await client.query(`UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1`, [postId]);
        liked = false;
      } else {
        await client.query(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
        await client.query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
        liked = true;
      }
      
      const countQuery = `SELECT likes_count FROM posts WHERE id = $1`;
      const countResult = await client.query(countQuery, [postId]);
      
      await client.query('COMMIT');
      
      return {
        liked,
        likesCount: countResult.rows[0].likes_count
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static mapRowToPost(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static mapRowToPostWithUser(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        email: '',
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url,
        isVerified: row.is_verified,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }
}