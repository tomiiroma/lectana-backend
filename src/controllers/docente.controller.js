import { z } from 'zod';
import { crearDocente, listarDocentes, obtenerPerfilDocente, actualizarPerfilDocente, obtenerDocentePorId, adminActualizarDocente } from '../services/docente.service.js';

const crearDocenteSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  email: z.string().email(),
  edad: z.number().int().min(18).max(80),
  password: z.string().min(6),
  dni: z.string().min(6),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1),
  institucion_pais: z.string().min(1),
  institucion_provincia: z.string().min(1),
  nivel_educativo: z.enum(['PRIMARIA','SECUNDARIA','AMBOS']).default('PRIMARIA')
});

export async function crearDocenteController(req, res, next) {
  try {
    const data = crearDocenteSchema.parse(req.body);
    const result = await crearDocente(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email') && 
        String(error.message).toLowerCase().includes('ya existe')) {
      return res.status(409).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  verificado: z.union([z.literal('true'), z.literal('false')]).optional(),
  activo: z.union([z.literal('true'), z.literal('false')]).optional()
});

export async function listarDocentesController(req, res, next) {
  try {
    const raw = listarSchema.parse(req.query);
    const params = {
      page: raw.page,
      limit: raw.limit,
      q: raw.q,
      verificado: typeof raw.verificado !== 'undefined' ? raw.verificado === 'true' : undefined,
      activo: typeof raw.activo !== 'undefined' ? raw.activo === 'true' : undefined
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

const idSchema = z.object({ id: z.coerce.number().int().positive() });

export async function obtenerPerfilDocenteController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilDocente(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(80).optional(),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1).optional(),
  institucion_pais: z.string().min(1).optional(),
  institucion_provincia: z.string().min(1).optional(),
  nivel_educativo: z.enum(['PRIMARIA','SECUNDARIA','AMBOS']).optional()
});

export async function actualizarPerfilDocenteController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilDocente(usuarioId, updates);
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

export async function obtenerDocentePorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerDocentePorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

const adminActualizarDocenteSchema = z.object({
  // Campos de usuario
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(80).optional(),
  activo: z.boolean().optional(),
  // Campos específicos de docente
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1).optional(),
  institucion_pais: z.string().min(1).optional(),
  institucion_provincia: z.string().min(1).optional(),
  nivel_educativo: z.enum(['PRIMARIA','SECUNDARIA','AMBOS']).optional(),
  verificado: z.boolean().optional()
});

export async function adminActualizarDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = adminActualizarDocenteSchema.parse(req.body);
    const result = await adminActualizarDocente(id, updates);
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
