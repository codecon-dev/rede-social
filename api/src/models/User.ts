import { pool } from '../config/database';
import { User, CreateUserData } from '../types';
import { hashPassword } from '../utils/auth';

export class UserModel {
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

  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, first_name, last_name, bio, avatar_url, is_verified, created_at, updated_at
      FROM users WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] ? this.mapRowToUser(result.rows[0]) : null;
  }

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
}