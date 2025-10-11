import { z } from 'zod';


export const crearCuentoSchema = z.object({
  titulo: z.string().min(1),
  edad_publico: z.number().int().min(4).max(18),
  url_img: z.string().url().optional(),
  duracion: z.number().int().positive().optional(),
  autor_id_autor: z.number().int().positive(),
  genero_id_genero: z.number().int().positive(),
  pdf_url: z.string().url().optional(),
});

export const actualizarCuentoSchema = crearCuentoSchema.partial();

export const listarCuentosSchema = z.object({
  edad_publico: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  genero_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  autor_id: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  titulo: z.string().optional(),
});

export const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});
