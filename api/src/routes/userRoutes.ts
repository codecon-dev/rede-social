import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getUserPosts,
  getTimeline,
  updateProfileValidation,
  getProfileByUsername
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/timeline', authenticateToken, getTimeline);
router.get('/username/:username', getProfileByUsername);
router.get('/:id', getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.get('/:id/posts', getUserPosts);

export { router as userRoutes };
