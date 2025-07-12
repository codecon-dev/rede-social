import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { JWTPayload } from '../types';

export const hashPassword = async (password: string): Promise<string> => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return hash === crypto.createHash('sha256').update(password).digest('hex');
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};
