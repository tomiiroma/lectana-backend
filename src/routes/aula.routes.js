import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  crearAulaController,
  crearAulaDocenteController,
  listarAulasController,
  obtenerAulaController,
  actualizarAulaController,
  eliminarAulaController,
  asignarCuentoAulaController,
  quitarCuentoAulaController,
  asignarAlumnoAulaController,
  quitarAlumnoAulaController,
  asignarDocenteAulaController,
  quitarDocenteAulaController,
  estadisticasAulasController,
  asignarEstudiantesAulaController,
  asignarCuentosAulaController,
  asignarCuentosAulaDocenteController,
  listarAulasDocenteController,
  obtenerAulaDocenteController,
  actualizarAulaDocenteController
} from '../controllers/aula.controller.js';
import { obtenerActividadesDeAulaController } from '../controllers/actividad.controller.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas específicas para docentes
router.post('/docente', requireAuth, requireRole('docente'), crearAulaDocenteController);
router.get('/docente', requireAuth, requireRole('docente'), listarAulasDocenteController);
router.get('/docente/:id', requireAuth, requireRole('docente'), obtenerAulaDocenteController);
router.put('/docente/:id', requireAuth, requireRole('docente'), actualizarAulaDocenteController);
router.put('/docente/:id/cuentos', requireAuth, requireRole('docente'), asignarCuentosAulaDocenteController);

// Rutas protegidas para administradores
router.post('/', requireAuth, requireRole('administrador'), crearAulaController);
router.get('/', requireAuth, requireRole('administrador'), listarAulasController);
router.get('/estadisticas/total', requireAuth, requireRole('administrador'), estadisticasAulasController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerAulaController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarAulaController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarAulaController);

// Rutas para asignar/quitar cuentos, alumnos y docentes
router.put('/:id/asignar-cuento', requireAuth, requireRole('administrador'), asignarCuentoAulaController);
router.put('/:id/quitar-cuento', requireAuth, requireRole('administrador'), quitarCuentoAulaController);
router.put('/:id/asignar-alumno', requireAuth, requireRole('administrador'), asignarAlumnoAulaController);
router.put('/:id/quitar-alumno', requireAuth, requireRole('administrador'), quitarAlumnoAulaController);
router.put('/:id/asignar-docente', requireAuth, requireRole('administrador'), asignarDocenteAulaController);
router.put('/:id/quitar-docente', requireAuth, requireRole('administrador'), quitarDocenteAulaController);

// Nuevas rutas para asignación masiva
router.put('/:id/estudiantes', requireAuth, requireRole('administrador'), asignarEstudiantesAulaController);
router.put('/:id/cuentos', requireAuth, requireRole('administrador'), asignarCuentosAulaController);

// Ruta para obtener actividades de un aula
router.get('/:id/actividades', requireAuth, requireRole('administrador'), obtenerActividadesDeAulaController);

export default router;
