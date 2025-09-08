import { Router } from 'express';
import { 
  crearCuentoController, 
  obtenerCuentoController, 
  listarCuentosController, 
  actualizarCuentoController, 
  eliminarCuentoController,
  obtenerCuentosPorAulaController
} from '../controllers/cuento.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas (para estudiantes y docentes)
router.get('/', listarCuentosController);
router.get('/:id', obtenerCuentoController);

// Rutas protegidas para docentes
router.get('/aula/:id', requireAuth, requireRole(['docente', 'administrador']), obtenerCuentosPorAulaController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearCuentoController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarCuentoController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarCuentoController);

export default router;
