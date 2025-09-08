import { Router } from 'express';
import { crearActividadController, obtenerActividadController, actualizarActividadController, eliminarActividadController } from '../controllers/actividad.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Todas las rutas requieren autenticación
router.use(requireAuth);

router.post('/', requireRole(['docente', 'administrador']), crearActividadController);
router.get('/:id', requireRole(['docente', 'administrador']), obtenerActividadController);
router.put('/:id', requireRole(['docente', 'administrador']), actualizarActividadController);
router.delete('/:id', requireRole(['docente', 'administrador']), eliminarActividadController);

export default router;
