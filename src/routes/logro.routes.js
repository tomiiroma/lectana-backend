
import { Router } from 'express';
import { 
  // Administrador
  crearLogroController, 
  listarLogrosController, 
  obtenerLogroController, 
  actualizarLogroController, 
  eliminarLogroController,
  verificarLogrosController,
  obtenerLogrosAlumnoController, 
  obtenerAlumnosLogroController,

  // Alumnos
  desbloquearLogroController,
  actualizarProgresoLogroController,
  obtenerLogrosDisponiblesController,
  obtenerMisLogrosController,
  obtenerEstadisticasLogrosController
  
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

// Administrador

router.post('/', requireAuth, requireRole('administrador'), upload.single('imagen'), crearLogroController);
router.get('/', requireAuth, requireRole('administrador'), listarLogrosController);

router.get('/:id/alumnos', requireAuth, requireRole('administrador'), obtenerAlumnosLogroController);

router.get('/:id', requireAuth, requireRole('administrador'), obtenerLogroController);

router.put('/:id', requireAuth, requireRole('administrador'), upload.single('imagen'), actualizarLogroController);

router.delete('/:id', requireAuth, requireRole('administrador'), eliminarLogroController);

// Alumnos

//logros disponibles con progreso del alumno
router.get('/disponibles', requireAuth, obtenerLogrosDisponiblesController);

//logros desbloqueados del alumno
router.get('/mis-logros', requireAuth, obtenerMisLogrosController);

//Obtener estadísticas de logros del alumno
router.get('/estadisticas', requireAuth, obtenerEstadisticasLogrosController);

router.post('/desbloquear', requireAuth, desbloquearLogroController);

//Actualizar progreso del logro
router.put('/progreso', requireAuth, actualizarProgresoLogroController);



export default router;