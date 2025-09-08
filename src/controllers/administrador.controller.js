import { z } from 'zod';
import { crearAdministrador, obtenerAdministradorPorId, actualizarAdministrador } from '../services/administrador.service.js';

const crearAdministradorSchema = z.object({
  dni: z.string().min(6),
  email: z.string().email(),
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
  email: z.string().email().optional(),
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
