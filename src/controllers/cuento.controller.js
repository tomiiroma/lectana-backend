import { z } from 'zod';
import { 
  crearCuento, 
  obtenerCuentoPorId, 
  listarCuentos, 
  actualizarCuento, 
  eliminarCuento,
  obtenerCuentosPorAula 
} from '../services/cuento.service.js';

const crearCuentoSchema = z.object({
  titulo: z.string().min(1),
  contenido: z.string().min(1),
  edad_publico: z.number().int().min(5).max(120),
  genero_id_genero: z.string().uuid(),
  autor_id_autor: z.string().uuid(),
  fuente: z.string().optional(),
  estado_legal: z.enum(['dominio_publico', 'licencia', 'propietario']).default('dominio_publico'),
  activo: z.boolean().default(true)
});

const actualizarCuentoSchema = crearCuentoSchema.partial();

const listarCuentosSchema = z.object({
  edad_publico: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  genero_id: z.string().uuid().optional(),
  autor_id: z.string().uuid().optional(),
  titulo: z.string().optional(),
  activo: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional()
});

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function crearCuentoController(req, res, next) {
  try {
    const data = crearCuentoSchema.parse(req.body);
    const result = await crearCuento(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerCuentoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerCuentoPorId(id);
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

export async function listarCuentosController(req, res, next) {
  try {
    const filtros = listarCuentosSchema.parse(req.query);
    const result = await listarCuentos(filtros);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function actualizarCuentoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarCuentoSchema.parse(req.body);
    const result = await actualizarCuento(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarCuentoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarCuento(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerCuentosPorAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerCuentosPorAula(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}
