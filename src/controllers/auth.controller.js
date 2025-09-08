import { z } from 'zod';
import { login } from '../services/auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginController(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login({ email, password });
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('credenciales')) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    next(error);
  }
}
