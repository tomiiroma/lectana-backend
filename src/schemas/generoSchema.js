import { z } from 'zod';

export const crearGeneroSchema = z.object({
  nombre: z.string().min(1),
});

export const actualizarGeneroSchema = crearGeneroSchema.partial();

export const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});