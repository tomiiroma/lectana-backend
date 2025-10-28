import { z } from 'zod';


export const crearLogroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default('')
});


export const actualizarLogroSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  url_imagen: z.string().optional(), 
});

export const idSchema = z.object({
   id: z.coerce.number().int().positive(),
});