import { Router } from 'express';
import { 
  crearDocenteController, 
  listarDocentesController,
  obtenerPerfilDocenteController,
  actualizarPerfilDocenteController,
  obtenerDocentePorIdController,
  adminActualizarDocenteController,
  completarActividadController
} from '../controllers/docente.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Crear docente (público)
router.post('/crear-docente', crearDocenteController);

// Perfil propio del docente (autenticado como docente)
router.get('/obtener-perfil-docente', requireAuth, requireRole('docente'), obtenerPerfilDocenteController);
router.put('/actualizar-perfil-docente', requireAuth, requireRole('docente'), actualizarPerfilDocenteController);

// Admin: Listar docentes y obtener por ID
router.get('/admin-listar-docentes', requireAuth, requireRole('administrador'), listarDocentesController);
router.get('/admin-obtener-docente/:id', requireAuth, requireRole('administrador'), obtenerDocentePorIdController);
router.put('/admin-actualizar-docente/:id', requireAuth, requireRole('administrador'), adminActualizarDocenteController);


router.post("/corregirActividad/:idActividad", requireAuth, completarActividadController)

export default router;
