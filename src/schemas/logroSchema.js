import { z } from 'zod';


export const crearLogroSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria: z.enum(['puntos', 'lectura', 'actividades', 'racha']),
  puntos_requeridos: z.number().int().min(1).optional(),
  icono_url: z.string().url().optional(),
  activo: z.boolean().default(true)
});

export const actualizarLogroSchema = crearLogroSchema.partial();

export const idSchema = z.object({
  id: z.string().uuid(),
});