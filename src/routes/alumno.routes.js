import { Router } from 'express';
import { 
  crearAlumnoController, 
  listarAlumnosController,
  obtenerPerfilAlumnoController,
  actualizarPerfilAlumnoController,
  obtenerAlumnoPorIdController,
  adminActualizarAlumnoController,
  responderPreguntaController,
  obtenerAulasAlumnoController
} from '../controllers/alumno.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Crear alumno (público)
router.post('/crear-alumno', crearAlumnoController);

// Perfil propio del alumno (autenticado como alumno)
router.get('/obtener-perfil-alumno', requireAuth, requireRole('alumno'), obtenerPerfilAlumnoController);
router.put('/actualizar-perfil-alumno', requireAuth, requireRole('alumno'), actualizarPerfilAlumnoController);

// Admin: Listar alumnos y obtener por ID
router.get('/admin-listar-alumnos', requireAuth, requireRole('administrador'), listarAlumnosController);
router.get('/admin-obtener-alumno/:id', requireAuth, requireRole('administrador'), obtenerAlumnoPorIdController);
router.put('/admin-actualizar-alumno/:id', requireAuth, requireRole('administrador'), adminActualizarAlumnoController);


router.post("/responder-pregunta/:id_pregunta", requireAuth, requireRole("alumno"), responderPreguntaController)

router.get("/obtenerAula", requireAuth, requireRole("alumno"), obtenerAulasAlumnoController)
export default router;
