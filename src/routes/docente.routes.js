import { Router } from 'express';
import { crearDocenteController, listarDocentesController } from '../controllers/docente.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Crear docente (público)
router.post('/crear-docente', crearDocenteController);

// Listar docentes (solo admin)
router.get('/admin-listar-docentes', requireAuth, requireRole('administrador'), listarDocentesController);

export default router;
