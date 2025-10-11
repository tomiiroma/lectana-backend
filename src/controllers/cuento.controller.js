import { z } from 'zod';
import { 
  crearCuento, 
  obtenerCuentoPorId, 
  listarCuentos, 
  actualizarCuento, 
  eliminarCuento,
  contarCuentos,
  listarCuentosPublicos,
  obtenerCuentoPublicoPorId,
} from '../services/cuento.service.js';

import { crearCuentoSchema, actualizarCuentoSchema, listarCuentosSchema, idSchema } from '../schemas/cuentoSchema.js';

const listarCuentosPublicosSchema = z.object({
  page: z.string().transform(val => val ? parseInt(val) : 1).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 10).pipe(z.number().int().min(1).max(50)).optional(),
  edad_publico: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  genero_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  autor_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  titulo: z.string().optional(),
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

export async function estadisticasCuentosController(req, res, next) {
  try {
    const total = await contarCuentos();
    res.json({ ok: true, data: { total } });
  } catch (error) {
    next(error);
  }
}

// Controladores para rutas públicas
export async function listarCuentosPublicosController(req, res, next) {
  try {
    const filtros = listarCuentosPublicosSchema.parse(req.query);
    const result = await listarCuentosPublicos(filtros);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerCuentoPublicoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerCuentoPublicoPorId(id);
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

// Sin controlador por aula en el nuevo esquema
