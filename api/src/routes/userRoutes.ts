import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getUserPosts,
  getTimeline,
  updateProfileValidation
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/timeline', authenticateToken, getTimeline);
router.get('/:id', getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.get('/:id/posts', getUserPosts);

export { router as userRoutes };
