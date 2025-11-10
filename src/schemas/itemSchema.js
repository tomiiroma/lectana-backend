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
  ).default(true),
  precio: z.coerce.number().int().positive('El precio debe ser un número positivo mayor a 0')
});


export const actualizarItemSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  descripcion: z.string().optional(),
  disponible: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'string') {
        return val === 'true' || val === '1';
      }
      return Boolean(val);
    },
    z.boolean().optional()
  ),
  precio: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return undefined;
      return num;
    },
    z.number().min(1, 'El precio debe ser mayor o igual a 1').optional()
  ),
  url_imagen: z.string().url('URL de imagen inválida').optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Debe proporcionar al menos un campo para actualizar'
);



export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const categoriaSchema = z.object({
  categoria: z.string()
});

export const tipoSchema = z.object({
  tipo: z.string()
});