import { z } from 'zod';


export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerAlumnoSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(5).max(120),
  password: z.string().min(8),
  codigo_acceso: z.string().optional(),
});

export const registerDocenteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(18).max(120),
  password: z.string().min(8),
  dni: z.string().min(7).max(15),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(2),
  institucion_pais: z.string().min(2),
  institucion_provincia: z.string().min(2),
  nivel_educativo: z.enum(['primaria', 'secundaria', 'ambos']),
});

export const registerAdministradorSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(18).max(120),
  password: z.string().min(8),
  dni: z.string().min(7).max(15),
  telefono: z.string().optional(),
});
