import { z } from 'zod';
import { crearDocente, obtenerDocentePorId, actualizarDocente } from '../services/docente.service.js';

const crearDocenteSchema = z.object({
  dni: z.string().min(6),
  email: z.string().email(),
  docente_col: z.string().optional(),
  usuario_id_usuario: z.number().int().positive(),
});

export async function crearDocenteController(req, res, next) {
  try {
    const payload = crearDocenteSchema.parse(req.body);
    const docente = await crearDocente(payload);
    res.status(201).json({ ok: true, docente });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

const idSchema = z.object({ id: z.coerce.number().int().positive() });

export async function obtenerDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const docente = await obtenerDocentePorId(id);
    if (!docente) return res.status(404).json({ ok: false, error: 'Docente no encontrado' });
    res.json({ ok: true, docente });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

const actualizarDocenteSchema = z.object({
  dni: z.string().min(6).optional(),
  email: z.string().email().optional(),
  docente_col: z.string().optional(),
  usuario_id_usuario: z.number().int().positive().optional(),
});

export async function actualizarDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarDocenteSchema.parse(req.body);
    const docente = await actualizarDocente(id, updates);
    res.json({ ok: true, docente });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}
