import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createTestimonial, getTestimonialsByUser } from '../controllers/grandmaTestimonialController';

const router = Router();

// Criar um novo depoimento de vovozinha
router.post('/', authenticateToken, createTestimonial);

// Buscar depoimentos de um usuário específico
router.get('/user/:userId', getTestimonialsByUser);

export { router as grandmaTestimonialRoutes };