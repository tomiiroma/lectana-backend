import { z } from 'zod';
import { crearAlumno, listarAlumnos, obtenerPerfilAlumno, actualizarPerfilAlumno, obtenerAlumnoPorId, adminActualizarAlumno } from '../services/alumno.service.js';
import { crearAlumnoSchema, listarSchema, actualizarPerfilSchema,adminActualizarAlumnoSchema } from '../schemas/alumnoSchema.js';
import { idSchema } from "../schemas/idSchema.js";

export async function crearAlumnoController(req, res, next) {
  try {
    const data = crearAlumnoSchema.parse(req.body);
    const result = await crearAlumno(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email') && 
        String(error.message).toLowerCase().includes('ya existe')) {
      return res.status(409).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('límite')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}


export async function listarAlumnosController(req, res, next) {
  try {
    const params = listarSchema.parse(req.query);
    const result = await listarAlumnos(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}


export async function obtenerPerfilAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilAlumno(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function actualizarPerfilAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilAlumno(usuarioId, updates);
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

export async function obtenerAlumnoPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerAlumnoPorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function adminActualizarAlumnoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = adminActualizarAlumnoSchema.parse(req.body);
    const result = await adminActualizarAlumno(id, updates);
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
