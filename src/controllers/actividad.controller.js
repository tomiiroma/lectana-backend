import { z } from 'zod';
import { 
  crearActividadConCuento, 
  crearActividadCompleta,
  obtenerTodasLasActividadesConAulas,
  obtenerActividadPorIdConAulas, 
  actualizarActividadCompleta,
  actualizarActividadCompletaConPreguntas, 
  eliminarActividad,
  asignarActividadAAulas,
  obtenerAulasDeActividad,
  removerActividadDeAula,
  obtenerActividadesDeAula
} from '../services/actividad.service.js';

const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear actividad con cuento
const crearActividadConCuentoSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo')
});

// Schema para crear actividad completa con preguntas
const crearActividadCompletaSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo'),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).min(1, 'Debe enviar al menos una respuesta')
  })).min(1, 'Debe enviar al menos una pregunta')
});

// Schema para asignar docente - ELIMINADO
// Ya no es necesario porque el docente se obtiene a través del aula

// Schema para actualizar actividad completa
const actualizarActividadCompletaSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta']).optional(),
  descripcion: z.string().min(1).optional(),
  cuento_id_cuento: z.number().int().positive().nullable().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// Schema para actualizar actividad completa con preguntas
const actualizarActividadCompletaConPreguntasSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1).optional(),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta']).optional(),
  cuento_id_cuento: z.number().int().positive().nullable().optional(),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).min(1, 'Debe enviar al menos una respuesta')
  })).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// 1. Crear actividad con cuento (cuento requerido desde el inicio)
export async function crearActividadConCuentoController(req, res, next) {
  try {
    const payload = crearActividadConCuentoSchema.parse(req.body);
    const actividad = await crearActividadConCuento(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Actividad creada exitosamente con cuento',
      actividad 
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

// 1.1. Crear actividad completa con preguntas y respuestas
export async function crearActividadCompletaController(req, res, next) {
  try {
    const payload = crearActividadCompletaSchema.parse(req.body);
    const actividad = await crearActividadCompleta(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Actividad completa creada exitosamente con preguntas y respuestas',
      actividad 
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

// 2. Asignar docente a una actividad - ELIMINADO
// Ya no es necesario porque el docente se obtiene a través del aula

// 3. Obtener todas las actividades (con aulas)
export async function obtenerTodasLasActividadesController(req, res, next) {
  try {
    const actividades = await obtenerTodasLasActividadesConAulas();
    res.json({ 
      ok: true, 
      actividades,
      total: actividades.length 
    });
  } catch (error) {
    next(error);
  }
}

// 4. Obtener actividad por ID (con aulas)
export async function obtenerActividadPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const actividad = await obtenerActividadPorIdConAulas(id);
    res.json({ ok: true, actividad });
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
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 5. Actualizar actividad completa
export async function actualizarActividadCompletaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadCompletaSchema.parse(req.body);
    const actividad = await actualizarActividadCompleta(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad actualizada exitosamente',
      actividad 
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
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 5.1. Actualizar actividad completa con preguntas y respuestas
export async function actualizarActividadCompletaConPreguntasController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadCompletaConPreguntasSchema.parse(req.body);
    const actividad = await actualizarActividadCompletaConPreguntas(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad completa actualizada exitosamente con preguntas y respuestas',
      actividad 
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
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 6. Eliminar actividad
export async function eliminarActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad eliminada exitosamente' 
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

// ===== CONTROLADORES PARA GESTIÓN DE AULAS =====

// Schema para asignar aulas
const asignarAulasSchema = z.object({
  aulas: z.array(z.number().int().positive('ID de aula debe ser positivo')).min(1, 'Debe enviar al menos un aula')
});

// 7. Asignar actividad a múltiples aulas
export async function asignarActividadAAulasController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { aulas } = asignarAulasSchema.parse(req.body);
    
    const asignaciones = await asignarActividadAAulas(id, aulas);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad asignada a aulas exitosamente',
      asignaciones,
      total_aulas: asignaciones.length
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

// 8. Obtener aulas asignadas a una actividad
export async function obtenerAulasDeActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const aulas = await obtenerAulasDeActividad(id);
    res.json({ 
      ok: true, 
      aulas,
      total: aulas.length 
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

// 9. Remover actividad de un aula específica
export async function removerActividadDeAulaController(req, res, next) {
  try {
    const { id, aulaId } = z.object({ 
      id: z.coerce.number().int().positive(),
      aulaId: z.coerce.number().int().positive()
    }).parse(req.params);
    
    await removerActividadDeAula(id, aulaId);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad removida del aula exitosamente' 
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

// 10. Obtener actividades de un aula específica (para usar en rutas de aula)
export async function obtenerActividadesDeAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const actividades = await obtenerActividadesDeAula(id);
    res.json({ 
      ok: true, 
      actividades,
      total: actividades.length 
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
