import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { UserModel } from '../models/User';
import { AuthRequest } from '../types';

/**
 * Middleware to authenticate the user based on the provided access token.
 * It checks for the token in the Authorization header, verifies it,
 * and attaches the user data to the request object if valid.
 *
 * @param {AuthRequest} req - The request object containing user data.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function to call.
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
