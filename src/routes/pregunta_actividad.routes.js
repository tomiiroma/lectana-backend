import { Router } from 'express';
import { 
  crearPreguntaController,
  crearPreguntasController,
  obtenerPreguntasActividadController,
  obtenerPreguntaPorIdController,
  actualizarPreguntaController,
  eliminarPreguntaController,
  eliminarPreguntasActividadController,
  agregarPreguntaAActividadController,
  actualizarPreguntaCompletaController,
  crearPreguntaParaActividadController
} from '../controllers/pregunta_actividad.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación de administrador


// 1. POST /pregunta - Crear pregunta individual
router.post('/', crearPreguntaController);

// 2. POST /pregunta/multiple - Crear múltiples preguntas
router.post('/multiple', crearPreguntasController);

// 3. GET /pregunta/actividad/:id - Obtener preguntas de una actividad
router.get('/actividad/:id', obtenerPreguntasActividadController);

// 4. GET /pregunta/:id - Obtener pregunta por ID
router.get('/:id', obtenerPreguntaPorIdController);

// 5. PUT /pregunta/:id - Actualizar pregunta
router.put('/:id', actualizarPreguntaController);

// 5.1. PUT /pregunta/:id/completa - Actualizar pregunta completa con respuestas
router.put('/:id/completa', actualizarPreguntaCompletaController);

// 6. DELETE /pregunta/:id - Eliminar pregunta individual
router.delete('/:id', eliminarPreguntaController);

// 7. DELETE /pregunta/actividad/:id - Eliminar todas las preguntas de una actividad
router.delete('/actividad/:id', eliminarPreguntasActividadController);

// 8. POST /pregunta/agregar - Agregar pregunta con respuestas a actividad existente
router.post('/agregar', agregarPreguntaAActividadController);


//NUEVAS RUTAS

router.post("/crearPreguntaActividad/:id_actividad",requireAuth, requireRole('docente'), crearPreguntaParaActividadController)

export default router;
