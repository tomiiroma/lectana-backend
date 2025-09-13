import { z } from 'zod';
import { crearAlumno, listarAlumnos } from '../services/alumno.service.js';

const crearAlumnoSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  email: z.string().email(),
  edad: z.number().int().min(5).max(18),
  password: z.string().min(6),
  aula_id: z.number().int().optional()
});

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

const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  aula_id: z.coerce.number().int().optional()
});

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
