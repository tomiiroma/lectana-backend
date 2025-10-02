import { z } from 'zod';
import { 
  crearPreguntaActividad,
  crearPreguntasActividad,
  obtenerPreguntasActividad,
  obtenerPreguntaPorId,
  actualizarPreguntaActividad,
  eliminarPreguntaActividad,
  eliminarPreguntasActividad,
  agregarPreguntaAActividad,
  actualizarPreguntaCompleta
} from '../services/pregunta_actividad.service.js';

const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear pregunta
const crearPreguntaSchema = z.object({
  enunciado: z.string().min(1, 'El enunciado es requerido'),
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo')
});

// Schema para crear múltiples preguntas
const crearPreguntasSchema = z.object({
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo'),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido')
  })).min(1, 'Debe enviar al menos una pregunta')
});

// Schema para actualizar pregunta
const actualizarPreguntaSchema = z.object({
  enunciado: z.string().min(1).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// Schema para agregar pregunta con respuestas
const agregarPreguntaSchema = z.object({
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo'),
  enunciado: z.string().min(1, 'El enunciado es requerido'),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).optional() // Las respuestas son opcionales para respuesta_abierta
});

// Schema para actualizar pregunta completa
const actualizarPreguntaCompletaSchema = z.object({
  enunciado: z.string().min(1).optional(),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).optional() // Las respuestas son opcionales para respuesta_abierta
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// 1. Crear pregunta individual
export async function crearPreguntaController(req, res, next) {
  try {
    const payload = crearPreguntaSchema.parse(req.body);
    const pregunta = await crearPreguntaActividad(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Pregunta creada exitosamente',
      pregunta 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 2. Crear múltiples preguntas
export async function crearPreguntasController(req, res, next) {
  try {
    const { actividad_id_actividad, preguntas } = crearPreguntasSchema.parse(req.body);
    const preguntasCreadas = await crearPreguntasActividad(actividad_id_actividad, preguntas);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Preguntas creadas exitosamente',
      preguntas: preguntasCreadas,
      total: preguntasCreadas.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 3. Obtener preguntas de una actividad
export async function obtenerPreguntasActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const preguntas = await obtenerPreguntasActividad(id);
    res.json({ 
      ok: true, 
      preguntas,
      total: preguntas.length 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 4. Obtener pregunta por ID
export async function obtenerPreguntaPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const pregunta = await obtenerPreguntaPorId(id);
    res.json({ ok: true, pregunta });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Pregunta no encontrada' 
      });
    }
    next(error);
  }
}

// 5. Actualizar pregunta
export async function actualizarPreguntaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarPreguntaSchema.parse(req.body);
    const pregunta = await actualizarPreguntaActividad(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Pregunta actualizada exitosamente',
      pregunta 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Pregunta no encontrada' 
      });
    }
    next(error);
  }
}

// 6. Eliminar pregunta
export async function eliminarPreguntaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarPreguntaActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Pregunta eliminada exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 7. Eliminar todas las preguntas de una actividad
export async function eliminarPreguntasActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarPreguntasActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Todas las preguntas de la actividad fueron eliminadas exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 8. Agregar pregunta con respuestas a actividad existente
export async function agregarPreguntaAActividadController(req, res, next) {
  try {
    const payload = agregarPreguntaSchema.parse(req.body);
    const pregunta = await agregarPreguntaAActividad(payload.actividad_id_actividad, {
      enunciado: payload.enunciado,
      respuestas: payload.respuestas
    });
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Pregunta agregada exitosamente',
      pregunta 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 9. Actualizar pregunta completa con respuestas
export async function actualizarPreguntaCompletaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarPreguntaCompletaSchema.parse(req.body);
    const pregunta = await actualizarPreguntaCompleta(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Pregunta completa actualizada exitosamente',
      pregunta 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Pregunta no encontrada' 
      });
    }
    next(error);
  }
}
