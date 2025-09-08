import { z } from 'zod';
import { crearAula, obtenerAulaPorId, actualizarAula, eliminarAula, listarAlumnosDeAula } from '../services/aula.service.js';

const idSchema = z.object({ id: z.coerce.number().int().positive() });

const crearAulaSchema = z.object({
  nombre_aula: z.string().min(1),
  grado: z.string().min(1),
  docente_id_docente: z.number().int().positive(),
});

export async function crearAulaController(req, res, next) {
  try {
    const payload = crearAulaSchema.parse(req.body);
    const aula = await crearAula(payload);
    res.status(201).json({ ok: true, aula });
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
    const aula = await obtenerAulaPorId(id);
    if (!aula) return res.status(404).json({ ok: false, error: 'Aula no encontrada' });
    res.json({ ok: true, aula });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

const actualizarAulaSchema = z.object({
  nombre_aula: z.string().min(1).optional(),
  grado: z.string().min(1).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

export async function actualizarAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarAulaSchema.parse(req.body);
    const aula = await actualizarAula(id, updates);
    res.json({ ok: true, aula });
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
    await eliminarAula(id);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function listarAlumnosDeAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const alumnos = await listarAlumnosDeAula(id);
    if (!alumnos.length) return res.json({ ok: true, alumnos: [], mensaje: 'No hay alumnos en el aula' });
    res.json({ ok: true, alumnos });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}
