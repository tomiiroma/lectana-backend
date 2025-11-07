import { Router } from 'express';

import { 
  crearItemController,
  actualizarItemController,
  listarItemsController,
  obtenerItemController
} from '../controllers/item.controller.js';

import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});


router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/', requireAuth, requireRole('administrador'), upload.single('imagen'), crearItemController);
router.put('/:id', requireAuth, requireRole('administrador'), upload.single('imagen'), actualizarItemController);
router.get('/',  requireAuth, requireRole('administrador'), listarItemsController);
router.get('/:id',  requireAuth, requireRole('administrador'), obtenerItemController);


export default router;