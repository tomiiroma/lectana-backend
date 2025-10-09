import { Router } from 'express';
import { agregarLibroFavoritos ,crearUsuarioController, obtenerUsuarioController, actualizarUsuarioController, desactivarUsuarioController, activarUsuarioController } from '../controllers/usuario.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

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


router.post('/fav-libro',requireAuth ,agregarLibroFavoritos)

export default router;
