import { Router } from 'express';
import { 
  crearAutorController, 
  obtenerAutorController, 
  listarAutoresController, 
  actualizarAutorController, 
  eliminarAutorController 
} from '../controllers/autor.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/', listarAutoresController);
router.get('/:id', obtenerAutorController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearAutorController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarAutorController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarAutorController);

export default router;
