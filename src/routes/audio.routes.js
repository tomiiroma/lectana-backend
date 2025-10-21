import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { 
  generarAudioController,
  obtenerAudioController,
  obtenerEstadoAudioController,
  eliminarAudioController
} from '../controllers/audio.controller.js';

const router = Router();

// Middleware de rate limiting para rutas protegidas
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas (sin autenticación)
router.get('/cuentos/:id/audio', obtenerAudioController);
router.get('/cuentos/:id/audio/status', obtenerEstadoAudioController);

// Rutas protegidas (requieren autenticación de administrador)
router.post('/cuentos/:id/generate-audio', requireAuth, requireRole('administrador'), generarAudioController);
router.delete('/cuentos/:id/audio', requireAuth, requireRole('administrador'), eliminarAudioController);

export default router;



