import { Router } from 'express';
import { 
  unirseAulaController, 
  obtenerAlumnoController, 
  obtenerProgresoController 
} from '../controllers/alumno.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas protegidas para alumnos
router.post('/unirse-aula', requireAuth, requireRole('alumno'), unirseAulaController);
router.get('/progreso', requireAuth, requireRole('alumno'), obtenerProgresoController);

// Ruta pública para obtener datos de alumno (para docentes)
router.get('/:id', requireAuth, requireRole(['docente', 'administrador']), obtenerAlumnoController);

export default router;
