import { Router } from 'express';
import { 
  crearRespuestaController,
  crearRespuestasController,
  obtenerRespuestasActividadController,
  obtenerRespuestaPorIdController,
  actualizarRespuestaController,
  eliminarRespuestaController,
  eliminarRespuestasActividadController
} from '../controllers/respuesta_actividad.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación de administrador
router.use(requireAuth);
router.use(requireRole('administrador'));

// 1. POST /respuesta - Crear respuesta individual
router.post('/', crearRespuestaController);

// 2. POST /respuesta/multiple - Crear múltiples respuestas
router.post('/multiple', crearRespuestasController);

// 3. GET /respuesta/pregunta/:id - Obtener respuestas de una pregunta
router.get('/pregunta/:id', obtenerRespuestasActividadController);

// 4. GET /respuesta/:id - Obtener respuesta por ID
router.get('/:id', obtenerRespuestaPorIdController);

// 5. PUT /respuesta/:id - Actualizar respuesta
router.put('/:id', actualizarRespuestaController);

// 6. DELETE /respuesta/:id - Eliminar respuesta individual
router.delete('/:id', eliminarRespuestaController);

// 7. DELETE /respuesta/pregunta/:id - Eliminar todas las respuestas de una pregunta
router.delete('/pregunta/:id', eliminarRespuestasActividadController);

export default router;
