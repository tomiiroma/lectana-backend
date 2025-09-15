import { Router } from 'express';
import { crearGeneroController, listarGenerosController, obtenerGeneroController } from '../controllers/genero.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', requireAuth, requireRole('administrador'), crearGeneroController);
router.get('/', requireAuth, requireRole('administrador'), listarGenerosController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerGeneroController);

export default router;


