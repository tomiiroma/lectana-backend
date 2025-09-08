import { Router } from 'express';
import { 
  crearGeneroController, 
  obtenerGeneroController, 
  listarGenerosController, 
  actualizarGeneroController, 
  eliminarGeneroController 
} from '../controllers/genero.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/', listarGenerosController);
router.get('/:id', obtenerGeneroController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearGeneroController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarGeneroController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarGeneroController);

export default router;
