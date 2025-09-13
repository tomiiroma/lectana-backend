import { Router } from 'express';
import { 
  loginController, 
  registerAlumnoController, 
  registerDocenteController, 
  registerAdministradorController,
  getMeController 
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/login', loginController);
router.post('/registro-form-alumno', registerAlumnoController);
router.post('/registro-form-docente', registerDocenteController);
router.post('/registro-form-administrador', registerAdministradorController);
router.get('/me', requireAuth, getMeController);

export default router;
