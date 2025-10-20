import { z } from 'zod';
import { 
  crearActividadCompleta,
  obtenerActividadesDeDocente,
  obtenerActividadPorIdDocente,
  actualizarActividadCompletaConPreguntas,
  eliminarActividad,
  asignarActividadAAulasDocente,
  obtenerActividadesDeAulaDocente
} from '../services/actividad-docente.service.js';
import { idSchema } from '../schemas/idSchema.js';
import { 
  crearActividadDocenteSchema,
  actualizarActividadDocenteSchema,
  asignarAulasDocenteSchema
} from '../schemas/actividadDocenteSchema.js';

// Controladores para gestión de actividades por docentes

// 1. Crear actividad como docente
export async function crearActividadDocenteController(req, res, next) {
  try {
    const payload = crearActividadDocenteSchema.parse(req.body);
    const docenteId = req.user.docente_id;
    
    const actividad = await crearActividadCompleta(payload, docenteId);
    
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Actividad creada exitosamente',
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

// 2. Obtener actividades del docente
export async function obtenerActividadesDocenteController(req, res, next) {
  try {
    const docenteId = req.user.docente_id;
    const actividades = await obtenerActividadesDeDocente(docenteId);
    
    res.json({ 
      ok: true, 
      actividades,
      total: actividades.length 
    });
  } catch (error) {
    next(error);
  }
}

// 3. Obtener actividad específica del docente
export async function obtenerActividadDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docenteId = req.user.docente_id;
    
    const actividad = await obtenerActividadPorIdDocente(id, docenteId);
    
    res.json({ ok: true, actividad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows') || error.message.includes('no encontrada') || error.message.includes('No tienes acceso')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 4. Actualizar actividad del docente
export async function actualizarActividadDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadDocenteSchema.parse(req.body);
    const docenteId = req.user.docente_id;
    
    const actividad = await actualizarActividadCompletaConPreguntas(id, updates, docenteId);
    
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
    if (error.message.includes('No rows') || error.message.includes('no encontrada') || error.message.includes('No tienes acceso')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 5. Eliminar actividad del docente
export async function eliminarActividadDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docenteId = req.user.docente_id;
    
    await eliminarActividad(id, docenteId);
    
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
    if (error.message.includes('No rows') || error.message.includes('no encontrada') || error.message.includes('No tienes acceso')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 6. Asignar actividad a aulas del docente
export async function asignarActividadAAulasDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { aulas_ids } = asignarAulasDocenteSchema.parse(req.body);
    const docenteId = req.user.docente_id;
    
    const asignaciones = await asignarActividadAAulasDocente(id, aulas_ids, docenteId);
    
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
    if (error.message.includes('No tienes acceso')) {
      return res.status(403).json({ 
        ok: false, 
        error: error.message 
      });
    }
    next(error);
  }
}

// 7. Obtener actividades de un aula específica del docente
export async function obtenerActividadesDeAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docenteId = req.user.docente_id;
    
    const actividades = await obtenerActividadesDeAulaDocente(id, docenteId);
    
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
    if (error.message.includes('No tienes acceso')) {
      return res.status(403).json({ 
        ok: false, 
        error: error.message 
      });
    }
    next(error);
  }
}