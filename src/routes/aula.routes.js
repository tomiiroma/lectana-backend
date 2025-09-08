import { Router } from 'express';
import { crearAulaController, obtenerAulaController, actualizarAulaController, eliminarAulaController, listarAlumnosDeAulaController } from '../controllers/aula.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Todas las rutas requieren autenticación
router.use(requireAuth);

router.post('/', requireRole(['docente', 'administrador']), crearAulaController);
router.get('/:id', requireRole(['docente', 'administrador']), obtenerAulaController);
router.put('/:id', requireRole(['docente', 'administrador']), actualizarAulaController);
router.delete('/:id', requireRole(['docente', 'administrador']), eliminarAulaController);
router.get('/:id/alumnos', requireRole(['docente', 'administrador']), listarAlumnosDeAulaController);

export default router;
