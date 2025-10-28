
import { Router } from 'express';
import { 
  crearLogroController, 
  listarLogrosController, 
  obtenerLogroController, 
  actualizarLogroController, 
  eliminarLogroController,
  verificarLogrosController,
  obtenerLogrosAlumnoController
} from '../controllers/logro.controller.js';
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


router.get('/alumno', requireAuth, obtenerLogrosAlumnoController);
router.post('/verificar', requireAuth, verificarLogrosController);


router.post('/', requireAuth, requireRole('administrador'), upload.single('imagen'), crearLogroController);
router.get('/', requireAuth, requireRole('administrador'), listarLogrosController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerLogroController);

router.put('/:id', requireAuth, requireRole('administrador'), upload.single('imagen'), actualizarLogroController);

router.delete('/:id', requireAuth, requireRole('administrador'), eliminarLogroController);

export default router;