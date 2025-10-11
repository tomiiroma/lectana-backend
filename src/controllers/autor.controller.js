import { z } from 'zod';
import { 
  crearAutor, 
  obtenerAutorPorId, 
  listarAutores, 
  actualizarAutor, 
  eliminarAutor 
} from '../services/autor.service.js';

import { crearAutorSchema, idSchema, actualizarAutorSchema } from '../schemas/autorSchema.js';




export async function crearAutorController(req, res, next) {
  try {
    const data = crearAutorSchema.parse(req.body);
    const result = await crearAutor(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerAutorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerAutorPorId(id);
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

export async function listarAutoresController(req, res, next) {
  try {
    const result = await listarAutores();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarAutorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarAutorSchema.parse(req.body);
    const result = await actualizarAutor(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarAutorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarAutor(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}
