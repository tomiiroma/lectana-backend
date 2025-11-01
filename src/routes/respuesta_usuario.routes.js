import { Router } from 'express';
import { 
  crearRespuestaUsuarioController,
  obtenerRespuestasUsuarioActividadController,
  obtenerRespuestasPreguntaController,
  obtenerRespuestaUsuarioPorIdController,
  actualizarRespuestaUsuarioController,
  eliminarRespuestaUsuarioController,
  obtenerEstadisticasActividadController,
  verificarRespuestaExistenteController,
  crearRespuestaAbiertaController
} from '../controllers/respuesta_usuario.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// 1. POST /respuesta-usuario - Crear respuesta de usuario
router.post('/', crearRespuestaUsuarioController);

// 2. GET /respuesta-usuario/alumno/:alumnoId/actividad/:actividadId - Obtener respuestas de alumno para actividad
router.get('/alumno/:alumnoId/actividad/:actividadId', obtenerRespuestasUsuarioActividadController);

// 3. GET /respuesta-usuario/pregunta/:id - Obtener todas las respuestas de una pregunta
router.get('/pregunta/:id', obtenerRespuestasPreguntaController);

// 4. GET /respuesta-usuario/:id - Obtener respuesta de usuario por ID
router.get('/:id', obtenerRespuestaUsuarioPorIdController);

// 5. PUT /respuesta-usuario/:id - Actualizar respuesta de usuario
router.put('/:id', actualizarRespuestaUsuarioController);

// 6. DELETE /respuesta-usuario/:id - Eliminar respuesta de usuario
router.delete('/:id', eliminarRespuestaUsuarioController);

// 7. GET /respuesta-usuario/estadisticas/:id - Obtener estadísticas de una actividad
router.get('/estadisticas/:id', obtenerEstadisticasActividadController);

// 8. GET /respuesta-usuario/verificar/:alumnoId/:preguntaId - Verificar si alumno ya respondió
router.get('/verificar/:alumnoId/:preguntaId', verificarRespuestaExistenteController);


//NUEVAS RUTAS

router.post("/crearRespuestaAbierta/:id_pregunta", crearRespuestaAbiertaController)
export default router;
