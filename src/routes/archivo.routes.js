import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { subirPDFController } from '../controllers/archivo.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Subida de PDF para cuento específico: /api/cuentos/:id/upload-pdf
router.post('/cuentos/:id/upload-pdf', requireAuth, requireRole('administrador'), upload.single('file'), subirPDFController);

export default router;


