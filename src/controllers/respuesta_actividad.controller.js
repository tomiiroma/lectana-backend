import { z } from 'zod';
import { 
  crearRespuestaActividad,
  crearRespuestasActividad,
  obtenerRespuestasActividad,
  obtenerRespuestaPorId,
  actualizarRespuestaActividad,
  eliminarRespuestaActividad,
  eliminarRespuestasActividad
} from '../services/respuesta_actividad.service.js';

const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear respuesta
const crearRespuestaSchema = z.object({
  respuesta: z.string().min(1, 'La respuesta es requerida'),
  es_correcta: z.boolean(),
  pregunta_actividad_id_pregunta_actividad: z.number().int().positive('ID de pregunta debe ser positivo')
});

// Schema para crear múltiples respuestas
const crearRespuestasSchema = z.object({
  pregunta_actividad_id_pregunta_actividad: z.number().int().positive('ID de pregunta debe ser positivo'),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).min(1, 'Debe enviar al menos una respuesta')
});

// Schema para actualizar respuesta
const actualizarRespuestaSchema = z.object({
  respuesta: z.string().min(1).optional(),
  es_correcta: z.boolean().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// 1. Crear respuesta individual
export async function crearRespuestaController(req, res, next) {
  try {
    const payload = crearRespuestaSchema.parse(req.body);
    const respuesta = await crearRespuestaActividad(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Respuesta creada exitosamente',
      respuesta 
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

// 2. Crear múltiples respuestas
export async function crearRespuestasController(req, res, next) {
  try {
    const { pregunta_actividad_id_pregunta_actividad, respuestas } = crearRespuestasSchema.parse(req.body);
    const respuestasCreadas = await crearRespuestasActividad(pregunta_actividad_id_pregunta_actividad, respuestas);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Respuestas creadas exitosamente',
      respuestas: respuestasCreadas,
      total: respuestasCreadas.length
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

// 3. Obtener respuestas de una pregunta
export async function obtenerRespuestasActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const respuestas = await obtenerRespuestasActividad(id);
    res.json({ 
      ok: true, 
      respuestas,
      total: respuestas.length 
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

// 4. Obtener respuesta por ID
export async function obtenerRespuestaPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const respuesta = await obtenerRespuestaPorId(id);
    res.json({ ok: true, respuesta });
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
        error: 'Respuesta no encontrada' 
      });
    }
    next(error);
  }
}

// 5. Actualizar respuesta
export async function actualizarRespuestaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarRespuestaSchema.parse(req.body);
    const respuesta = await actualizarRespuestaActividad(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Respuesta actualizada exitosamente',
      respuesta 
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
        error: 'Respuesta no encontrada' 
      });
    }
    next(error);
  }
}

// 6. Eliminar respuesta
export async function eliminarRespuestaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarRespuestaActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Respuesta eliminada exitosamente' 
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

// 7. Eliminar todas las respuestas de una pregunta
export async function eliminarRespuestasActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarRespuestasActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Todas las respuestas de la pregunta fueron eliminadas exitosamente' 
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
