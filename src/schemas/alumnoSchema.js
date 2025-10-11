import { z } from 'zod';

export const crearAlumnoSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  email: z.string().email(),
  edad: z.number().int().min(5).max(18),
  password: z.string().min(6),
  aula_id: z.number().int().nullable().optional()
});

export const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  aula_id: z.coerce.number().int().optional(),
  activo: z.union([z.literal('true'), z.literal('false')]).optional()
});

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(5).max(18).optional(),
  nacionalidad: z.string().optional(),
  alumno_col: z.string().optional(),
  aula_id_aula: z.number().int().optional()
});

export const adminActualizarAlumnoSchema = z.object({
  // Campos de usuario
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(5).max(18).optional(),
  activo: z.boolean().optional(),
  // Campos específicos de alumno
  nacionalidad: z.string().optional(),
  alumno_col: z.string().optional(),
  aula_id_aula: z.number().int().nullable().optional()
});