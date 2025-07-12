import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PostModel } from '../models/Post';
import { AuthRequest, CreatePostData } from '../types';

export const createPostValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
];

export const updatePostValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters')
];

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const postData: CreatePostData = req.body;

    const post = await PostModel.create(userId, postData);

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { id } = req.params;
    const postId = parseInt(id);
    const userId = req.user!.id;
    const { content } = req.body;

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const updatedPost = await PostModel.update(postId, userId, content);
    if (!updatedPost) {
      res.status(404).json({ error: 'Post not found or you do not have permission to edit it' });
      return;
    }

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const userId = req.user!.id;

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const deleted = await PostModel.delete(postId, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found or you do not have permission to delete it' });
      return;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    const userId = req.user!.id;

    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const result = await PostModel.toggleLike(postId, userId);

    res.json({
      message: result.liked ? 'Post liked' : 'Post unliked',
      liked: result.liked,
      likesCount: result.likesCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};