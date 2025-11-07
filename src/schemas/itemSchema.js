import { z } from 'zod';


export const crearItemSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default(''),
  disponible: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val === 'true' || val === '1';
      }
      return Boolean(val);
    },
    z.boolean()
  ).default(true)
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