import { Router } from 'express';
import { crearCuentoController, listarCuentosController, obtenerCuentoController, estadisticasCuentosController } from '../controllers/cuento.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', requireAuth, requireRole('administrador'), crearCuentoController);
router.get('/', requireAuth, requireRole('administrador'), listarCuentosController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerCuentoController);
router.get('/estadisticas/total', requireAuth, requireRole('administrador'), estadisticasCuentosController);

export default router;


