import { Router } from 'express';

import { 
  crearItemController,
  actualizarItemController,
  listarItemsController,
  obtenerItemController,
  reactivarItemController,
  deshabilitarItemController,
  obtenerItemsDisponiblesController,
  obtenerItemsCompradosController,
  comprarItemController,
  obtenerAlumnosPorItemController
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

// Alumno android


// Comprar avatar
router.post('/comprar/:id', requireAuth, requireRole('alumno'), comprarItemController);

// Items disponibles en la tienda
router.get('/disponibles', requireAuth, requireRole('alumno'), obtenerItemsDisponiblesController);

// items del alumno
router.get('/mis-items', requireAuth, requireRole('alumno'), obtenerItemsCompradosController);


// Admin




router.get('/', requireAuth, requireRole('administrador'), listarItemsController);
router.post('/', requireAuth, requireRole('administrador'), upload.single('imagen'), crearItemController);


router.get('/:id/alumnos', requireAuth, requireRole('administrador'), obtenerAlumnosPorItemController);
router.patch('/:id/reactivar', requireAuth, requireRole('administrador'), reactivarItemController);


router.get('/:id', requireAuth, requireRole('administrador'), obtenerItemController);
router.put('/:id', requireAuth, requireRole('administrador'), upload.single('imagen'), actualizarItemController);
router.delete('/:id', requireAuth, requireRole('administrador'), deshabilitarItemController);

export default router;