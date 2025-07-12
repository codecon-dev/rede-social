import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { comparePassword, generateToken } from '../utils/auth';
import { CreateUserData, LoginData } from '../types';

/**
 * Validation rules for user registration.
 * These rules will be applied to the request body.
 * - Username must be between 3 and 50 characters, alphanumeric and underscores only.
 * - Email must be a valid email format.
 * - Password must be at least 6 characters long and contain at least one uppercase letter,
 *   one lowercase letter, and one number.
 * * Optional fields:
 * - First name and last name must be less than 100 characters.
 */
export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters')
];

/**
 * Validation rules for user login.
 * These rules will be applied to the request body.
 * - Email must be a valid email format.
 * - Password must not be empty.
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Handles the user registration.
 * Validates the request body, checks for existing users, creates a new user,
 * and returns a JWT token along with user details.
 *
 * @param {Request} req - The request object containing user data.
 * @param {Response} res - The response object to send the result.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const userData: CreateUserData = req.body;

    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const existingUsername = await UserModel.findByUsername(userData.username);
    if (existingUsername) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const user = await UserModel.create(userData);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Handles the user login.
 * Validates the request body, checks user credentials, and returns a JWT token along with user details.
 *
 * @param {Request} req - The request object containing login data.
 * @param {Response} res - The response object to send the result.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { email, password }: LoginData = req.body;

    const user = await UserModel.findByEmailWithPassword(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Handles the "me" endpoint to get the authenticated user's information.
 * Requires a valid JWT token for authentication.
 *
 * @param {Request} req - The request object containing user data from the token.
 * @param {Response} res - The response object to send the user info.
 */
export const me = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};
