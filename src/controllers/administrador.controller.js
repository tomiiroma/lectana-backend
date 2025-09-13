import { z } from 'zod';
import { crearAdministrador, obtenerAdministradorPorId, actualizarAdministrador, listarAdministradores, obtenerPerfilAdministrador, actualizarPerfilAdministrador } from '../services/administrador.service.js';

const crearAdministradorSchema = z.object({
  dni: z.string().min(6),
  usuario_id_usuario: z.number().int().positive(),
});

export async function crearAdministradorController(req, res, next) {
  try {
    const payload = crearAdministradorSchema.parse(req.body);
    const admin = await crearAdministrador(payload);
    res.status(201).json({ ok: true, administrador: admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

const idSchema = z.object({ id: z.coerce.number().int().positive() });

export async function obtenerAdministradorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const admin = await obtenerAdministradorPorId(id);
    if (!admin) return res.status(404).json({ ok: false, error: 'Administrador no encontrado' });
    res.json({ ok: true, administrador: admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

const actualizarAdministradorSchema = z.object({
  dni: z.string().min(6).optional(),
  usuario_id_usuario: z.number().int().positive().optional(),
});

export async function actualizarAdministradorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarAdministradorSchema.parse(req.body);
    const admin = await actualizarAdministrador(id, updates);
    res.json({ ok: true, administrador: admin });
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
  q: z.string().optional()
});

export async function listarAdministradoresController(req, res, next) {
  try {
    const params = listarSchema.parse(req.query);
    const result = await listarAdministradores(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerPerfilAdministradorController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilAdministrador(usuarioId);
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
  dni: z.string().min(6).optional()
});

export async function actualizarPerfilAdministradorController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilAdministrador(usuarioId, updates);
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
