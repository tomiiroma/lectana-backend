import { z } from 'zod';
import { crearActividad, obtenerActividadPorId, actualizarActividad, eliminarActividad } from '../services/actividad.service.js';

const idSchema = z.object({ id: z.coerce.number().int().positive() });

const crearActividadSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  fecha_publicacion: z.coerce.date().nullable().optional(),
  tipo: z.string().min(1),
  descripcion: z.string().min(1),
  cuento_id_cuento: z.number().int().positive(),
  docente_id_docente: z.number().int().positive(),
});

export async function crearActividadController(req, res, next) {
  try {
    const payload = crearActividadSchema.parse(req.body);
    const actividad = await crearActividad(payload);
    res.status(201).json({ ok: true, actividad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const actividad = await obtenerActividadPorId(id);
    if (!actividad) return res.status(404).json({ ok: false, error: 'Actividad no encontrada' });
    res.json({ ok: true, actividad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

const actualizarActividadSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  fecha_publicacion: z.coerce.date().nullable().optional(),
  tipo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  cuento_id_cuento: z.number().int().positive().optional(),
  docente_id_docente: z.number().int().positive().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

export async function actualizarActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadSchema.parse(req.body);
    const actividad = await actualizarActividad(id, updates);
    res.json({ ok: true, actividad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarActividad(id);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}
