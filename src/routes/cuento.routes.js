import { Router } from 'express';
import { 
  crearCuentoController, 
  listarCuentosController, 
  obtenerCuentoController, 
  actualizarCuentoController, 
  estadisticasCuentosController,
  listarCuentosPublicosController,
  obtenerCuentoPublicoController
} from '../controllers/cuento.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/publicos', listarCuentosPublicosController);
router.get('/publicos/:id', obtenerCuentoPublicoController);

// Middleware de rate limiting para rutas protegidas
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas protegidas (requieren autenticación de administrador)
router.post('/', requireAuth, requireRole('administrador'), crearCuentoController);
router.get('/', requireAuth, requireRole('administrador'), listarCuentosController);
router.get('/estadisticas/total', requireAuth, requireRole('administrador'), estadisticasCuentosController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerCuentoController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarCuentoController);

export default router;


