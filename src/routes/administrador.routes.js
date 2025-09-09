import { Router } from 'express';
import { crearAdministradorController, obtenerAdministradorController, actualizarAdministradorController, listarAdministradoresController } from '../controllers/administrador.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearAdministradorController);
router.get('/', requireAuth, requireRole('administrador'), listarAdministradoresController);
router.get('/:id', obtenerAdministradorController);
router.put('/:id', actualizarAdministradorController);

export default router;
