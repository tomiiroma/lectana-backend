import { Router } from 'express';
import { 
  crearLogroController, 
  obtenerLogroController, 
  listarLogrosController, 
  actualizarLogroController, 
  eliminarLogroController,
  verificarLogrosController,
  obtenerLogrosAlumnoController
} from '../controllers/logro.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/', listarLogrosController);
router.get('/:id', obtenerLogroController);

// Rutas para alumnos
router.post('/verificar', requireAuth, requireRole('alumno'), verificarLogrosController);
router.get('/mis-logros/obtenidos', requireAuth, requireRole('alumno'), obtenerLogrosAlumnoController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearLogroController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarLogroController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarLogroController);

export default router;
