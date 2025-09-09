import { Router } from 'express';
import { 
  subirImagenController,
  subirMultipleImagenesController,
  eliminarImagenController,
  listarImagenesController,
  obtenerEstadisticasAlmacenamientoController
} from '../controllers/imagen.controller.js';
import { upload, uploadMultiple } from '../services/imagen.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/listar', listarImagenesController);
router.get('/estadisticas', obtenerEstadisticasAlmacenamientoController);

// Rutas para administradores (subir/eliminar imágenes)
router.post('/subir', 
  requireAuth, 
  requireRole('administrador'), 
  upload.single('imagen'), 
  subirImagenController
);

router.post('/subir-multiple', 
  requireAuth, 
  requireRole('administrador'), 
  uploadMultiple.array('imagenes', 10), // Máximo 10 imágenes
  subirMultipleImagenesController
);

router.delete('/eliminar', 
  requireAuth, 
  requireRole('administrador'), 
  eliminarImagenController
);

export default router;