import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { PostModel } from '../models/Post';
import { AuthRequest } from '../types';

/**
 * Validation rules for updating user profile.
 * These rules will be applied to the request body.
 * - First name and last name must be less than 100 characters.
 * - Bio must be less than 500 characters.
 */
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

/**
 * Handles the retrieval of a user profile.
 * Validates the request parameters and returns the user profile if found.
 *
 * @param {Request} req - The request object containing the user ID in the parameters.
 * @param {Response} res - The response object to send the result.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

/**
 * Handles the update of a user profile.
 * Validates the request body, checks for errors, and updates the user profile in the database.
 *
 * @param {AuthRequest} req - The request object containing user data and profile updates.
 * @param {Response} res - The response object to send the result.
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const userId = req.user!.id;
    const updates = req.body;

    const updatedUser = await UserModel.updateProfile(userId, updates);
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Handles the retrieval of posts created by a specific user.
 * Validates the request parameters and returns the user's posts with pagination.
 *
 * @param {Request} req - The request object containing the user ID in the parameters.
 * @param {Response} res - The response object to send the result.
 */
export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await PostModel.findByUserId(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
};

/**
 * Handles following a user.
 * Requires authentication and validates that the user is not trying to follow themselves.
 *
 * @param {Request} req - The request object containing the user ID in the parameters.
 * @param {Response} res - The response object to send the result.
 */
export const followUser = async (req: any, res: Response): Promise<void> => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;
    const followingId = parseInt(id);

    if (isNaN(followingId)) {
      res.status(400).json({ error: 'Invalid user id' });
      return;
    }

    if (followerId === followingId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const targetUser = await UserModel.findById(followerId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isFollowing = await UserModel.followUser(followerId, followingId);

    res.json({
      message: isFollowing ? 'Successfully followed user' : 'Already following user',
      isFollowing: true
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

/**
 * Handles unfollowing a user.
 * Requires authentication and validates that the user is not trying to follow themselves.
 *
 * @param {Request} req - The request object containing the user ID in the parameters.
 * @param {Response} res - The response object to send the result.
 */
export const unfollowUser = async (req: any, res: Response): Promise<void> => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;
    const followingId = parseInt(id);

    if (isNaN(followingId)) {
      res.status(400).json({ error: 'Invalid user id' });
      return;
    }

    const targetUser = await UserModel.findById(followingId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const wasFollowing = await UserModel.unfollowUser(followerId, followingId);

    res.json({
      message: wasFollowing ? 'Successfully unfollowed user' : 'Not following user',
      isFollowing: false
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
}

/**
 * Checks if the authenticated user is following another user.
 * Requires authentication.
 *
 * @param {Request} req - The request object containing the user ID in the parameters.
 * @param {Response} res - The response object to send the result.
 */
export const checkFollowStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const followerId = req.user.id;
    const { id } = req.params;
    const followingId = parseInt(id);

    if (isNaN(followingId)) {
      res.status(400).json({ error: 'Invalid user id' });
      return;
    }

    const isFollowing = await UserModel.isFollowing(followerId, followingId);

    res.json({
      isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
}

/**
 * Handles the retrieval of the user's timeline.
 * Returns posts from users that the authenticated user follows, with pagination.
 *
 * @param {AuthRequest} req - The request object containing user data.
 * @param {Response} res - The response object to send the result.
 */
export const getTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    const posts = await PostModel.getTimeline(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to get timeline' });
  }
};

/**
 * Handles the retrieval of the user's timeline.
 * Returns posts from users that the authenticated user follows, with pagination.
 *
 * @param {Request} req - The request object containing user data.
 * @param {Response} res - The response object to send the result.
 */
export const getProfileByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'Username not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error('Get profile by username error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

/**
 * Gets the list of users the authenticated user is following (panelinha members).
 * Requires authentication.
 *
 * @param {Request} req - The request object containing user data from the token.
 * @param {Response} res - The response object to send the members list.
 */
export const getPanelinhaMembers = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    const members = await UserModel.getPanelinhaMembers(userId, limit, offset);
    
    res.json({
      members,
      pagination: {
        page,
        limit,
        hasMore: members.length === limit
      }
    });
  } catch (error) {
    console.error('Get panelinha members error:', error);
    res.status(500).json({ error: 'Failed to get panelinha members' });
  }
};

/**
 * Gets the number of users the authenticated user is following.
 * Requires authentication.
 *
 * @param {Request} req - The request object containing user data from the token.
 * @param {Response} res - The response object to send the members list.
 */
export const getPanelinhaMembersCount = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const count = await UserModel.getFollowingCount(userId);

    res.json({
      count
    })
  } catch (error) {
    console.error('Get panelinha members count error:', error);
    res.status(500).json({ error: 'Failed to get panelinha members count' });
  }
};
