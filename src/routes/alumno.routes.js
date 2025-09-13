import { Router } from 'express';
import { crearAlumnoController, listarAlumnosController } from '../controllers/alumno.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Crear alumno (público)
router.post('/crear-alumno', crearAlumnoController);

// Listar alumnos (solo admin)
router.get('/admin-listar-alumnos', requireAuth, requireRole('administrador'), listarAlumnosController);

export default router;
