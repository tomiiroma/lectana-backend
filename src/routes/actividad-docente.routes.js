import { Router } from 'express';
import { 
  crearActividadDocenteController,
  obtenerActividadesDocenteController,
  obtenerActividadDocenteController,
  actualizarActividadDocenteController,
  eliminarActividadDocenteController,
  asignarActividadAAulasDocenteController,
  obtenerActividadesDeAulaDocenteController
} from '../controllers/actividad-docente.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación de docente
router.use(requireAuth);
router.use(requireRole('docente'));

// ===== RUTAS PARA GESTIÓN DE ACTIVIDADES POR DOCENTES =====

// 1. POST /api/docentes/actividades - Crear actividad completa
router.post('/', crearActividadDocenteController);

// 2. GET /api/docentes/actividades - Obtener todas las actividades del docente
router.get('/', obtenerActividadesDocenteController);

// 3. GET /api/docentes/actividades/:id - Obtener actividad específica del docente
router.get('/:id', obtenerActividadDocenteController);

// 4. PUT /api/docentes/actividades/:id - Actualizar actividad del docente
router.put('/:id', actualizarActividadDocenteController);

// 5. DELETE /api/docentes/actividades/:id - Eliminar actividad del docente
router.delete('/:id', eliminarActividadDocenteController);

// 6. PUT /api/docentes/actividades/:id/asignar-aulas - Asignar actividad a aulas del docente
router.put('/:id/asignar-aulas', asignarActividadAAulasDocenteController);

// 7. GET /api/docentes/actividades/aula/:id - Obtener actividades de un aula específica del docente
router.get('/aula/:id', obtenerActividadesDeAulaDocenteController);

export default router;





