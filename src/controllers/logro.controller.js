import { z } from 'zod';
import { 
  crearLogro, 
  obtenerLogroPorId, 
  listarLogros, 
  actualizarLogro, 
  eliminarLogro,
  verificarLogros,
  obtenerLogrosAlumno
} from '../services/logro.service.js';

const crearLogroSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria: z.enum(['puntos', 'lectura', 'actividades', 'racha']),
  puntos_requeridos: z.number().int().min(1).optional(),
  icono_url: z.string().url().optional(),
  activo: z.boolean().default(true)
});

const actualizarLogroSchema = crearLogroSchema.partial();

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function crearLogroController(req, res, next) {
  try {
    const data = crearLogroSchema.parse(req.body);
    const result = await crearLogro(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerLogroPorId(id);
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

export async function listarLogrosController(req, res, next) {
  try {
    const result = await listarLogros();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarLogroSchema.parse(req.body);
    const result = await actualizarLogro(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarLogro(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function verificarLogrosController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await verificarLogros(usuarioId);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function obtenerLogrosAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerLogrosAlumno(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}
