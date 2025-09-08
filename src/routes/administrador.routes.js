import { Router } from 'express';
import { crearAdministradorController, obtenerAdministradorController, actualizarAdministradorController } from '../controllers/administrador.controller.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearAdministradorController);
router.get('/:id', obtenerAdministradorController);
router.put('/:id', actualizarAdministradorController);

export default router;
