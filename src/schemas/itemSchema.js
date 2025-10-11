import { z } from 'zod';


export const crearItemSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  tipo: z.enum(['avatar', 'marco', 'fondo', 'badge', 'accesorio']),
  categoria: z.enum(['superheroe', 'animal', 'fantasia', 'deportes', 'musica', 'arte', 'naturaleza']),
  precio_puntos: z.number().int().min(1),
  url_imagen: z.string().url(),
  activo: z.boolean().default(true)
});

export const actualizarItemSchema = crearItemSchema.partial();

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const categoriaSchema = z.object({
  categoria: z.string()
});

export const tipoSchema = z.object({
  tipo: z.string()
});