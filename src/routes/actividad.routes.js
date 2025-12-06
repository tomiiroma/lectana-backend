import { Router } from 'express';
import { 
  crearActividadConCuentoController,
  crearActividadCompletaController,
  obtenerTodasLasActividadesController,
  obtenerActividadPorIdController,
  actualizarActividadCompletaController,
  actualizarActividadCompletaConPreguntasController,
  eliminarActividadController,
  asignarActividadAAulasController,
  obtenerAulasDeActividadController,
  removerActividadDeAulaController,
  crearActividadController,
  getActividadPorAulaController,
  getActividadCompletaController,
  corregirActividadController
} from '../controllers/actividad.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación de administrador
router.use(requireAuth);
router.use(requireRole('administrador', 'docente', 'alumno'));

// 1. POST /actividad - Crear actividad con cuento (cuento requerido desde el inicio)
router.post('/', crearActividadConCuentoController);

// 1.1. POST /actividad/completa - Crear actividad completa con preguntas y respuestas
router.post('/completa', crearActividadCompletaController);

// 2. PUT /actividad/:id/docente - ELIMINADO
// Ya no es necesario porque el docente se obtiene a través del aula

// 3. GET /actividad - Obtener todas las actividades
router.get('/', obtenerTodasLasActividadesController);

// 4. GET /actividad/:id - Obtener actividad por ID
router.get('/:id', obtenerActividadPorIdController);

// 5. PUT /actividad/:id - Actualizar actividad completa
router.put('/:id', actualizarActividadCompletaController);

// 5.1. PUT /actividad/:id/completa - Actualizar actividad completa con preguntas y respuestas
router.put('/:id/completa', actualizarActividadCompletaConPreguntasController);

// 6. DELETE /actividad/:id - Eliminar actividad
router.delete('/:id', eliminarActividadController);

// ===== RUTAS PARA GESTIÓN DE AULAS =====

// 7. PUT /actividad/:id/aulas - Asignar actividad a múltiples aulas
router.put('/:id/aulas', asignarActividadAAulasController);

// 8. GET /actividad/:id/aulas - Obtener aulas asignadas a una actividad
router.get('/:id/aulas', obtenerAulasDeActividadController);

// 9. DELETE /actividad/:id/aulas/:aulaId - Remover actividad de un aula específica
router.delete('/:id/aulas/:aulaId', removerActividadDeAulaController);



//NUEVAS RUTAS

router.post("/crearActividad", requireAuth, requireRole('docente'), crearActividadController)

router.get("/actividadesPorAula/:id_aula", requireAuth, getActividadPorAulaController)

router.get("/actividadCompleta/:idActividad", requireAuth, getActividadCompletaController)

router.post("/corregirActividad", requireAuth, corregirActividadController)

export default router;
