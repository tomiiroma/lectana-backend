import { Router } from 'express';
import { crearUsuarioController, obtenerUsuarioController, actualizarUsuarioController, desactivarUsuarioController, activarUsuarioController } from '../controllers/usuario.controller.js';

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
router.put('/desactivarUsuario/:id', desactivarUsuarioController);
router.put('/activarUsuario/:id', activarUsuarioController);

export default router;
