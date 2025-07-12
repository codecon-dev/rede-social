import { Router } from 'express';
import { register, login, me, registerValidation, loginValidation } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, me);

export { router as authRoutes };