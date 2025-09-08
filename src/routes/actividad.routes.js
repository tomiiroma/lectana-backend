import { Router } from 'express';
import { crearActividadController, obtenerActividadController, actualizarActividadController, eliminarActividadController } from '../controllers/actividad.controller.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', crearActividadController);
router.get('/:id', obtenerActividadController);
router.put('/:id', actualizarActividadController);
router.delete('/:id', eliminarActividadController);

export default router;
