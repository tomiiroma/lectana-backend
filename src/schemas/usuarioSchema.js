import { z } from 'zod';


export const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, 'nombre requerido'),
  apellido: z.string().min(1, 'apellido requerido'),
  email: z.string().email('email inválido'),
  edad: z.number().int().min(5).max(120),
  password: z.string().min(8, 'password mínimo 8 caracteres'),
});

export const obtenerUsuarioSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(5).max(120).optional(),
  password: z.string().min(8).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });