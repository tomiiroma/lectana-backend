import { z } from 'zod';
import { 
  crearRespuestaUsuario,
  obtenerRespuestasUsuarioActividad,
  obtenerRespuestasPregunta,
  obtenerRespuestaUsuarioPorId,
  actualizarRespuestaUsuario,
  eliminarRespuestaUsuario,
  verificarRespuestaExistente,
  obtenerEstadisticasActividad,
} from '../services/respuesta_usuario.service.js';

import { crearRespuestaUsuarioSchema, actualizarRespuestaUsuarioSchema, idSchema } from '../schemas/respuestaUsuarioSchema.js';

// 1. Crear respuesta de usuario
export async function crearRespuestaUsuarioController(req, res, next) {
  try {
    const payload = crearRespuestaUsuarioSchema.parse(req.body);
    
    // Verificar si el alumno ya respondió esta pregunta
    const yaRespondio = await verificarRespuestaExistente(
      payload.alumno_id_alumno, 
      payload.pregunta_actividad_id_pregunta_actividad
    );
    
    if (yaRespondio) {
      return res.status(409).json({ 
        ok: false, 
        error: 'El alumno ya respondió esta pregunta' 
      });
    }
    
    const respuesta = await crearRespuestaUsuario(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Respuesta enviada exitosamente',
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

// 2. Obtener respuestas de un alumno para una actividad
export async function obtenerRespuestasUsuarioActividadController(req, res, next) {
  try {
    const { alumnoId, actividadId } = z.object({ 
      alumnoId: z.coerce.number().int().positive(),
      actividadId: z.coerce.number().int().positive()
    }).parse(req.params);
    
    const respuestas = await obtenerRespuestasUsuarioActividad(alumnoId, actividadId);
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

// 3. Obtener todas las respuestas de una pregunta
export async function obtenerRespuestasPreguntaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const respuestas = await obtenerRespuestasPregunta(id);
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

// 4. Obtener respuesta de usuario por ID
export async function obtenerRespuestaUsuarioPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const respuesta = await obtenerRespuestaUsuarioPorId(id);
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

// 5. Actualizar respuesta de usuario
export async function actualizarRespuestaUsuarioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarRespuestaUsuarioSchema.parse(req.body);
    const respuesta = await actualizarRespuestaUsuario(id, updates);
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

// 6. Eliminar respuesta de usuario
export async function eliminarRespuestaUsuarioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarRespuestaUsuario(id);
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

// 7. Obtener estadísticas de una actividad
export async function obtenerEstadisticasActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const estadisticas = await obtenerEstadisticasActividad(id);
    res.json({ 
      ok: true, 
      estadisticas
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

// 8. Verificar si un alumno ya respondió una pregunta
export async function verificarRespuestaExistenteController(req, res, next) {
  try {
    const { alumnoId, preguntaId } = z.object({ 
      alumnoId: z.coerce.number().int().positive(),
      preguntaId: z.coerce.number().int().positive()
    }).parse(req.params);
    
    const yaRespondio = await verificarRespuestaExistente(alumnoId, preguntaId);
    res.json({ 
      ok: true, 
      ya_respondio: yaRespondio
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


