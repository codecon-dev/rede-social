import { Router } from 'express';
import { 
  createPost, 
  getPost, 
  updatePost, 
  deletePost, 
  toggleLike,
  createPostValidation,
  updatePostValidation 
} from '../controllers/postController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createPostValidation, createPost);
router.get('/:id', getPost);
router.put('/:id', authenticateToken, updatePostValidation, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/like', authenticateToken, toggleLike);

export { router as postRoutes };
