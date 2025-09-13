import { Router } from 'express';
import { crearAdministradorController, obtenerAdministradorController, actualizarAdministradorController, listarAdministradoresController } from '../controllers/administrador.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/crear-administrador', crearAdministradorController);

router.get('/listar-administradores', requireAuth, requireRole('administrador'), listarAdministradoresController);

router.get('/obtener-administrador/:id', obtenerAdministradorController);
router.put('/actualizar-administrador/:id', actualizarAdministradorController);

export default router;
