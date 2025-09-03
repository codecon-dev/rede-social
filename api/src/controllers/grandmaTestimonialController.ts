import { Request, Response } from 'express';
import { grandmaTestimonialService } from '../services/grandmaTestimonialService';

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target_user_id, theme, testimonial_text } = req.body;
    const author_id = req.user?.id;

    if (!author_id) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!target_user_id || !theme || !testimonial_text) {
      res.status(400).json({ error: 'target_user_id, theme e testimonial_text são obrigatórios' });
      return;
    }

    // Verificar se não está tentando criar depoimento para si mesmo
    if (author_id === target_user_id) {
      res.status(400).json({ error: 'Você não pode criar um depoimento para si mesmo, sua vovó não aprovaria!' });
      return;
    }

    const result = await grandmaTestimonialService.processAndCreateTestimonial(
      author_id,
      target_user_id,
      theme,
      testimonial_text
    );

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json({
      message: 'Depoimento da vovó enviado com muito carinho! 👵💕',
      testimonial: result.testimonial
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getTestimonialsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'userId é obrigatório' });
      return;
    }

    const testimonials = await grandmaTestimonialService.getTestimonialsByUserId(parseInt(userId));

    res.status(200).json({
      testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};