import { Router } from 'express';
import { 
  crearItemController, 
  obtenerItemController, 
  listarItemsController, 
  actualizarItemController, 
  eliminarItemController,
  comprarItemController,
  obtenerItemsCompradosController
} from '../controllers/item.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/', listarItemsController);
router.get('/:id', obtenerItemController);

// Rutas para alumnos
router.post('/:id/comprar', requireAuth, requireRole('alumno'), comprarItemController);
router.get('/mis-items/comprados', requireAuth, requireRole('alumno'), obtenerItemsCompradosController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearItemController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarItemController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarItemController);

export default router;
