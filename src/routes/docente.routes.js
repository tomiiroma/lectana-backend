import { Router } from 'express';
import { crearDocenteController, obtenerDocenteController, actualizarDocenteController, listarDocentesController } from '../controllers/docente.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearDocenteController);
router.get('/', requireAuth, requireRole('administrador'), listarDocentesController);
router.get('/:id', obtenerDocenteController);
router.put('/:id', actualizarDocenteController);

export default router;
