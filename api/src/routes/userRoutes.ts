import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getUserPosts,
  getTimeline,
  updateProfileValidation,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getProfileByUsername
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/timeline', authenticateToken, getTimeline);
router.get('/username/:username', getProfileByUsername);
router.get('/:id', getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.get('/:id/posts', getUserPosts);

router.post('/:id/follow', authenticateToken, followUser);
router.delete('/:id/follow', authenticateToken, unfollowUser);
router.get('/:id/follow-status', authenticateToken, checkFollowStatus);

export { router as userRoutes };
