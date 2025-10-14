import { z } from 'zod';
import { 
  crearAula, 
  crearAulaDocente,
  obtenerAulaPorId, 
  listarAulas, 
  actualizarAula, 
  eliminarAula,
  asignarCuentoAula,
  quitarCuentoAula,
  asignarAlumnoAula,
  quitarAlumnoAula,
  asignarDocenteAula,
  quitarDocenteAula,
  contarAulas,
  asignarEstudiantesAula,
  asignarCuentosAula,
  asignarCuentosAulaDocente,
  listarAulasDocente,
  obtenerAulaDocente,
  actualizarAulaDocente,
  eliminarAulaDocente
} from '../services/aula.service.js';
import { agregarCuentoAulaDocente, quitarCuentoAulaDocente, quitarEstudianteAulaDocente, obtenerActividadesEstudianteAula } from '../services/aula.service.js';

import { crearAulaSchema,  actualizarAulaSchema, asignarCuentoSchema, asignarAlumnoSchema,asignarDocenteSchema, idSchema, asignarEstudiantesSchema,asignarCuentosSchema} from '../schemas/aulaSchema.js';

export async function crearAulaController(req, res, next) {
  try {
    const data = crearAulaSchema.parse(req.body);
    const result = await crearAula(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerAulaPorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function listarAulasController(req, res, next) {
  try {
    const result = await listarAulas();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarAulaSchema.parse(req.body);
    const result = await actualizarAula(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarAula(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Asignar cuento al aula
export async function asignarCuentoAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { cuento_id_cuento } = asignarCuentoSchema.parse(req.body);
    const result = await asignarCuentoAula(id, cuento_id_cuento);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Quitar cuento del aula
export async function quitarCuentoAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { cuento_id_cuento } = asignarCuentoSchema.parse(req.body);
    const result = await quitarCuentoAula(id, cuento_id_cuento);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Asignar alumno al aula
export async function asignarAlumnoAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { alumno_id_alumno } = asignarAlumnoSchema.parse(req.body);
    const result = await asignarAlumnoAula(id, alumno_id_alumno);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Quitar alumno del aula
export async function quitarAlumnoAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { alumno_id_alumno } = asignarAlumnoSchema.parse(req.body);
    const result = await quitarAlumnoAula(id, alumno_id_alumno);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Asignar docente al aula
export async function asignarDocenteAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { docente_id_docente } = asignarDocenteSchema.parse(req.body);
    const result = await asignarDocenteAula(id, docente_id_docente);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Quitar docente del aula
export async function quitarDocenteAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await quitarDocenteAula(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Estadísticas de aulas
export async function estadisticasAulasController(req, res, next) {
  try {
    const total = await contarAulas();
    res.json({ ok: true, data: { total } });
  } catch (error) {
    next(error);
  }
}

export async function asignarEstudiantesAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { estudiantes_ids } = asignarEstudiantesSchema.parse(req.body);
    
    const result = await asignarEstudiantesAula(id, estudiantes_ids);
    
    res.status(200).json({
      ok: true,
      data: result,
      message: 'Estudiantes asignados al aula exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function asignarCuentosAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { cuentos_ids } = asignarCuentosSchema.parse(req.body);
    
    const result = await asignarCuentosAula(id, cuentos_ids);
    
    res.status(200).json({
      ok: true,
      data: result,
      message: 'Cuentos asignados al aula exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

// Controlador para que docentes creen aulas
export async function crearAulaDocenteController(req, res, next) {
  try {
    const data = crearAulaSchema.parse(req.body);
    const docenteId = req.user.docente_id; // Obtener ID del docente desde el token
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden crear aulas.' 
      });
    }

    const result = await crearAulaDocente(data, docenteId);
    res.status(201).json({ 
      ok: true, 
      data: result,
      message: 'Aula creada exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// Controlador para que docentes asignen cuentos a sus aulas
export async function asignarCuentosAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { cuentos_ids } = asignarCuentosSchema.parse(req.body);
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden asignar cuentos.' 
      });
    }

    const result = await asignarCuentosAulaDocente(id, cuentos_ids, docenteId);
    
    res.status(200).json({
      ok: true,
      data: result,
      message: 'Cuentos asignados al aula exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Agregar cuento puntual (POST /aulas/docente/:id/cuentos)
export async function agregarCuentoAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params); // id_aula
    const body = z.object({ id_cuento: z.number().int().positive() }).parse(req.body);
    const docenteId = req.user.docente_id;

    if (!docenteId) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado. Solo los docentes pueden modificar aulas.' });
    }

    // Idempotencia: si ya existe, el servicio no duplicará
    const result = await agregarCuentoAulaDocente(id, body.id_cuento, docenteId);
    return res.status(200).json({ ok: true, message: 'Cuento agregado al aula', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    const msg = String(error.message).toLowerCase();
    if (msg.includes('no autorizado')) return res.status(403).json({ ok: false, error: error.message });
    if (msg.includes('no encontrada') || msg.includes('no encontrado')) return res.status(404).json({ ok: false, error: error.message });
    return next(error);
  }
}

// Quitar cuento puntual (DELETE /aulas/docente/:id/cuentos/:id_cuento)
export async function quitarCuentoAulaDocenteController(req, res, next) {
  try {
    const params = z.object({ id: z.string(), id_cuento: z.string() }).parse(req.params);
    const id = parseInt(params.id);
    const id_cuento = parseInt(params.id_cuento);
    if (!Number.isInteger(id) || !Number.isInteger(id_cuento)) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }
    const docenteId = req.user.docente_id;
    if (!docenteId) {
      return res.status(403).json({ ok: false, error: 'Acceso denegado. Solo los docentes pueden modificar aulas.' });
    }

    const result = await quitarCuentoAulaDocente(id, id_cuento, docenteId);
    return res.status(200).json({ ok: true, message: 'Cuento removido del aula', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    const msg = String(error.message).toLowerCase();
    if (msg.includes('no autorizado')) return res.status(403).json({ ok: false, error: error.message });
    if (msg.includes('asignación no encontrada')) return res.status(404).json({ ok: false, error: 'No estaba asignado' });
    if (msg.includes('no encontrada') || msg.includes('no encontrado')) return res.status(404).json({ ok: false, error: error.message });
    return next(error);
  }
}

// Controlador para que docentes vean sus aulas
export async function listarAulasDocenteController(req, res, next) {
  try {
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden ver sus aulas.' 
      });
    }

    const result = await listarAulasDocente(docenteId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

// Controlador para que docentes vean el detalle de su aula
export async function obtenerAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden ver aulas.' 
      });
    }

    const result = await obtenerAulaDocente(id, docenteId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Controlador para que docentes actualicen sus aulas
export async function actualizarAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarAulaSchema.parse(req.body);
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden actualizar aulas.' 
      });
    }

    const result = await actualizarAulaDocente(id, data, docenteId);
    res.json({ 
      ok: true, 
      data: result,
      message: 'Aula actualizada exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Controlador para que docentes eliminen sus aulas
export async function eliminarAulaDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden eliminar aulas.' 
      });
    }

    const result = await eliminarAulaDocente(id, docenteId);
    res.json({ 
      ok: true, 
      message: 'Aula eliminada correctamente',
      data: null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no encontrada')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('estudiantes asignados')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Controlador para que docentes quiten estudiantes de sus aulas
export async function quitarEstudianteAulaDocenteController(req, res, next) {
  try {
    const params = z.object({ 
      id: z.string(), 
      id_estudiante: z.string() 
    }).parse(req.params);
    
    const aulaId = parseInt(params.id);
    const estudianteId = parseInt(params.id_estudiante);
    
    if (!Number.isInteger(aulaId) || !Number.isInteger(estudianteId)) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }
    
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden quitar estudiantes.' 
      });
    }

    const result = await quitarEstudianteAulaDocente(aulaId, estudianteId, docenteId);
    res.json({ 
      ok: true, 
      message: 'Estudiante removido del aula correctamente',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no está asignado')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Controlador para obtener actividades de un estudiante específico en un aula
export async function obtenerActividadesEstudianteAulaController(req, res, next) {
  try {
    const params = z.object({ 
      id: z.string(), 
      id_estudiante: z.string() 
    }).parse(req.params);
    
    const aulaId = parseInt(params.id);
    const estudianteId = parseInt(params.id_estudiante);
    
    if (!Number.isInteger(aulaId) || !Number.isInteger(estudianteId)) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }
    
    const docenteId = req.user.docente_id;
    
    if (!docenteId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado. Solo los docentes pueden ver actividades de estudiantes.' 
      });
    }

    const result = await obtenerActividadesEstudianteAula(aulaId, estudianteId, docenteId);
    res.json({ 
      ok: true, 
      message: 'Actividades del estudiante obtenidas correctamente',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no autorizado')) {
      return res.status(403).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}