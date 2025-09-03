import { pool } from '../config/database';

export interface GrandmaTestimonial {
  id?: number;
  author_id: number;
  target_user_id: number;
  theme: string;
  original_text: string;
  final_testimonial: string;
  blessing: string;
  created_at?: Date;
}

export interface TestimonialValidationResult {
  isValid: boolean;
  error?: string;
}

class GrandmaTestimonialService {
  private carinhosoWords = [
    'fofinho', 'querido', 'benzinho', 'lindeza', 'amorzinho', 'gracinha', 
    'docinho', 'coraçãozinho', 'anjinho', 'florzinha', 'lindinho', 'gostosinho',
    'bonitinho', 'princesinha', 'princesinho', 'meu bem', 'tesouro', 'vida',
    'amor', 'fofo', 'lindo', 'bonito', 'precioso', 'querida', 'querido'
  ];

  private blessings = [
    'Que Deus te abençoe e te livre das friagem!',
    'Jesus te proteja do sereno!',
    'Que Nossa Senhora te cubra com seu manto!',
    'Que os anjinhos te guardem!',
    'Que você tenha saúde e paz!',
    'Que Deus ilumine seus caminhos!',
    'Que você sempre tenha comida na mesa!',
    'Que a vida te dê só alegrias!',
    'Que você encontre um bom partido!',
    'Que seus sonhos se realizem!',
    'Que você seja muito feliz na vida!',
    'Que Deus te dê muitos anos de vida!'
  ];

  validateGrandmaTestimonial(text: string): TestimonialValidationResult {
    // Verificar palavras carinhosas
    const words = text.toLowerCase().split(/\s+/);
    const foundCarinhosoWords = this.carinhosoWords.filter(word => 
      words.some(w => w.includes(word) || word.includes(w))
    );

    if (foundCarinhosoWords.length < 2) {
      return {
        isValid: false,
        error: 'Sua vó ficaria decepcionada com essa frieza! Use pelo menos 2 palavrinhas carinhosas.'
      };
    }

    // Verificar emojis de coração, florzinha ou beijinho
    const emojiPattern = /[❤️💕💖💗💘💝💞💓💟🥰😘😙😚💋🌸🌺🌼🌻🌷🏵️💐]/g;
    const emojiMatches = text.match(emojiPattern);
    
    if (!emojiMatches || emojiMatches.length < 3) {
      return {
        isValid: false,
        error: 'Precisa de pelo menos 3 emojis de coração, florzinha ou beijinho! 💕🌸😘'
      };
    }

    return { isValid: true };
  }

  generateRandomBlessing(): string {
    return this.blessings[Math.floor(Math.random() * this.blessings.length)];
  }

  formatTestimonial(originalText: string): { finalTestimonial: string; blessing: string } {
    const blessing = this.generateRandomBlessing();
    const cleanedText = originalText.replace(/^oi meu docinho,?\s*/i, '');
    const finalTestimonial = `Oi meu docinho, ${cleanedText} ${blessing} 💕🌸😘`;
    
    return { finalTestimonial, blessing };
  }

  async createTestimonial(testimonial: Omit<GrandmaTestimonial, 'id' | 'created_at'>): Promise<GrandmaTestimonial> {
    const query = `
      INSERT INTO grandma_testimonials (author_id, target_user_id, theme, original_text, final_testimonial, blessing)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      testimonial.author_id,
      testimonial.target_user_id,
      testimonial.theme,
      testimonial.original_text,
      testimonial.final_testimonial,
      testimonial.blessing
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getTestimonialsByUserId(userId: number): Promise<GrandmaTestimonial[]> {
    const query = `
      SELECT gt.*, 
             u.username as author_username,
             u.first_name as author_first_name,
             u.last_name as author_last_name
      FROM grandma_testimonials gt
      JOIN users u ON gt.author_id = u.id
      WHERE gt.target_user_id = $1
      ORDER BY gt.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async processAndCreateTestimonial(
    authorId: number,
    targetUserId: number,
    theme: string,
    originalText: string
  ): Promise<{ success: boolean; testimonial?: GrandmaTestimonial; error?: string }> {
    try {
      // Validar o texto original
      const validation = this.validateGrandmaTestimonial(originalText);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Formatar o depoimento
      const { finalTestimonial, blessing } = this.formatTestimonial(originalText);

      // Criar o depoimento no banco
      const testimonial = await this.createTestimonial({
        author_id: authorId,
        target_user_id: targetUserId,
        theme,
        original_text: originalText,
        final_testimonial: finalTestimonial,
        blessing
      });

      return { success: true, testimonial };
    } catch (error) {
      console.error('Error processing testimonial:', error);
      return { success: false, error: 'Erro interno do servidor ao processar depoimento' };
    }
  }
}

export const grandmaTestimonialService = new GrandmaTestimonialService();