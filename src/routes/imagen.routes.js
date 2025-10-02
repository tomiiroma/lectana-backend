import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { subirImagenCuentoController, uploadImagenYAsociarCuentoController } from '../controllers/imagen.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Subida de imagen JPG/PNG a bucket cuentos-imagenes
router.post('/upload', requireAuth, requireRole('administrador'), upload.single('file'), subirImagenCuentoController);
router.post('/cuentos/:id/upload-imagen', requireAuth, requireRole('administrador'), upload.single('file'), uploadImagenYAsociarCuentoController);

export default router;


