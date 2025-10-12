import { z } from 'zod';


export const crearDocenteSchema = z.object({
  usuario_id_usuario: z.number().int().positive(),
  dni: z.string().min(6),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1),
  institucion_pais: z.string().min(1),
  institucion_provincia: z.string().min(1),
  nivel_educativo: z.enum(['primaria','secundaria','ambos']).default('primaria')
});

export const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  verificado: z.union([z.literal('true'), z.literal('false')]).optional(),
  activo: z.union([z.literal('true'), z.literal('false')]).optional()
});

export const idSchema = z.object({ id: z.coerce.number().int().positive() });

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(80).optional(),
  dni: z.string().min(6).optional(),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1).optional(),
  institucion_pais: z.string().min(1).optional(),
  institucion_provincia: z.string().min(1).optional(),
  nivel_educativo: z.enum(['primaria','secundaria','ambos']).optional()
});

export const adminActualizarDocenteSchema = z.object({
  // Campos de usuario
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(80).optional(),
  activo: z.boolean().optional(),
  // Campos específicos de docente
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(1).optional(),
  institucion_pais: z.string().min(1).optional(),
  institucion_provincia: z.string().min(1).optional(),
  nivel_educativo: z.enum(['primaria','secundaria','ambos']).optional(),
  verificado: z.boolean().optional()
});