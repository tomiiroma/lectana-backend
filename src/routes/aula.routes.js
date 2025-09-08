import { Router } from 'express';
import { crearAulaController, obtenerAulaController, actualizarAulaController, eliminarAulaController, listarAlumnosDeAulaController } from '../controllers/aula.controller.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearAulaController);
router.get('/:id', obtenerAulaController);
router.put('/:id', actualizarAulaController);
router.delete('/:id', eliminarAulaController);
router.get('/:id/alumnos', listarAlumnosDeAulaController);

export default router;
