import { z } from 'zod';
import { 
  crearGenero, 
  obtenerGeneroPorId, 
  listarGeneros, 
  actualizarGenero, 
  eliminarGenero 
} from '../services/genero.service.js';

const crearGeneroSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true)
});

const actualizarGeneroSchema = crearGeneroSchema.partial();

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function crearGeneroController(req, res, next) {
  try {
    const data = crearGeneroSchema.parse(req.body);
    const result = await crearGenero(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerGeneroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerGeneroPorId(id);
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

export async function listarGenerosController(req, res, next) {
  try {
    const result = await listarGeneros();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarGeneroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarGeneroSchema.parse(req.body);
    const result = await actualizarGenero(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarGeneroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarGenero(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}
