import { z } from 'zod';
import { unirseAula, obtenerAlumnoPorId, obtenerProgresoAlumno, listarAlumnos } from '../services/alumno.service.js';

const unirseAulaSchema = z.object({
  codigo_acceso: z.string().min(6).max(10),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function unirseAulaController(req, res, next) {
  try {
    const { codigo_acceso } = unirseAulaSchema.parse(req.body);
    const usuarioId = req.user.sub;
    
    const result = await unirseAula(usuarioId, codigo_acceso);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('código') || 
        String(error.message).toLowerCase().includes('ya está')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerAlumnoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerAlumnoPorId(id);
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

export async function obtenerProgresoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerProgresoAlumno(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  aula_id: z.coerce.number().int().optional()
});

export async function listarAlumnosController(req, res, next) {
  try {
    const params = listarSchema.parse(req.query);
    const result = await listarAlumnos(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}
