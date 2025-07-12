import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { JWTPayload } from '../types';

/**
 * Hashes a password using SHA-256.
 * This is a simple hashing function and should not be used for production password storage.
 * For production, consider using bcrypt or Argon2 for better security.
 *
 * @param password Password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Compares a plain text password with a hashed password.
 *
 * @param password The plain text password
 * @param hash The hashed password
 * @returns True if the passwords match, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return hash === crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Generates a JWT token.
 *
 * @param payload The payload to include in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not configured');
  }
  const options: jwt.SignOptions = {
    expiresIn: parseInt(config.jwt.expiresIn)
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param token The JWT token to verify
 * @returns The decoded payload if the token is valid
 * @throws Will throw an error if the token is invalid or expired
 */
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};
