import { z } from 'zod';
export const crearAutorSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
});

export const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

export const actualizarAutorSchema = crearAutorSchema.partial();
