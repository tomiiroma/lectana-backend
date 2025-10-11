import { z } from 'zod';
import { 
  crearCuento, 
  obtenerCuentoPorId, 
  listarCuentos, 
  actualizarCuento, 
  eliminarCuento,
  contarCuentos,
} from '../services/cuento.service.js';

import { crearCuentoSchema, actualizarCuentoSchema, listarCuentosSchema, idSchema } from '../schemas/cuentoSchema.js';

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

// Sin controlador por aula en el nuevo esquema
