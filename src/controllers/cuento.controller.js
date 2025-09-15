import { z } from 'zod';
import { 
  crearCuento, 
  obtenerCuentoPorId, 
  listarCuentos, 
  actualizarCuento, 
  eliminarCuento,
} from '../services/cuento.service.js';

const crearCuentoSchema = z.object({
  titulo: z.string().min(1),
  edad_publico: z.number().int().min(4).max(18),
  url_img: z.string().url().optional(),
  duracion: z.number().int().positive().optional(),
  autor_id_autor: z.number().int().positive(),
  genero_id_genero: z.number().int().positive(),
  pdf_url: z.string().url().optional(),
});

const actualizarCuentoSchema = crearCuentoSchema.partial();

const listarCuentosSchema = z.object({
  edad_publico: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  genero_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  autor_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  titulo: z.string().optional(),
});

const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
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

// Sin controlador por aula en el nuevo esquema
