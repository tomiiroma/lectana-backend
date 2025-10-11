import { z } from 'zod';
import { 
  crearAula, 
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
  asignarCuentosAula
} from '../services/aula.service.js';

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