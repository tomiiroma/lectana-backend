import { z } from 'zod';
import { crearDocente, obtenerDocentePorId, actualizarDocente, listarDocentes } from '../services/docente.service.js';

const crearDocenteSchema = z.object({
  dni: z.string().min(6),
  telefono: z.string().optional(),
  institucion_nombre: z.string().optional(),
  institucion_pais: z.string().optional(),
  institucion_provincia: z.string().optional(),
  nivel_educativo: z.enum(['PRIMARIA','SECUNDARIA','AMBOS']).optional(),
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
  telefono: z.string().optional(),
  institucion_nombre: z.string().optional(),
  institucion_pais: z.string().optional(),
  institucion_provincia: z.string().optional(),
  nivel_educativo: z.enum(['PRIMARIA','SECUNDARIA','AMBOS']).optional(),
  verificado: z.boolean().optional(),
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

const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  verificado: z.union([z.literal('true'), z.literal('false')]).optional()
});

export async function listarDocentesController(req, res, next) {
  try {
    const raw = listarSchema.parse(req.query);
    const params = {
      page: raw.page,
      limit: raw.limit,
      q: raw.q,
      verificado: typeof raw.verificado !== 'undefined' ? raw.verificado === 'true' : undefined
    };
    const result = await listarDocentes(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}
