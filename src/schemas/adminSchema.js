import { z } from 'zod';

export const crearAdministradorSchema = z.object({
  dni: z.string().min(6),
  usuario_id_usuario: z.number().int().positive(),
});

export const actualizarAdministradorSchema = z.object({
  dni: z.string().min(6).optional(),
  usuario_id_usuario: z.number().int().positive().optional(),
});

export const adminActualizarAdministradorSchema = z.object({
  // Campos de usuario
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(120).optional(),
  activo: z.boolean().optional(),
  // Campos específicos de administrador
  dni: z.string().min(6).optional()
});

export const listarSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  activo: z.union([z.literal('true'), z.literal('false')]).optional()
});

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).max(50).optional(),
  apellido: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(18).max(80).optional(),
  dni: z.string().min(6).optional()
});
/////////
export const listarTodosSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional()
});

export const cambiarContrasenaSchema = z.object({
  contrasena_actual: z.string().min(1, 'La contraseña actual es requerida'),
  nueva_contrasena: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
});


