import { Router } from 'express';
import { crearAutorController, listarAutoresController, obtenerAutorController } from '../controllers/autor.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', requireAuth, requireRole('administrador'), crearAutorController);
router.get('/', requireAuth, requireRole('administrador'), listarAutoresController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerAutorController);

export default router;


