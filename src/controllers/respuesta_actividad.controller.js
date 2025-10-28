import { z } from 'zod';
import { 
  crearRespuestaActividad,
  crearRespuestasActividad,
  obtenerRespuestasActividad,
  obtenerRespuestaPorId,
  actualizarRespuestaActividad,
  eliminarRespuestaActividad,
  eliminarRespuestasActividad,
  crearRespuestaParaActividad
} from '../services/respuesta_actividad.service.js';

import { crearRespuestaSchema, idSchema, crearRespuestasSchema, actualizarRespuestaSchema } from '../schemas/respuestaActividadSchema.js';

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

//NUEVAS FUNCIONES

export async function crearRespuestaActividadController(req,res){
  try{
  const {id_pregunta} = req.params
  const {respuesta, es_correcta} = req.body;

  const respuestaActividad = await crearRespuestaParaActividad(respuesta, es_correcta, id_pregunta)

  res.status(200).json({respuestaActividad})
  }catch(error){
    throw new Error(error.message)
    console.log("Error", error.message)
  }

}