import { Router } from 'express';
import { crearUsuarioController, obtenerUsuarioController, actualizarUsuarioController } from '../controllers/usuario.controller.js';

const router = Router();

// Aplicar rate limiter si está disponible desde app (inyectado por app.set)
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearUsuarioController);
router.get('/:id', obtenerUsuarioController);
router.put('/:id', actualizarUsuarioController);

export default router;
