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


// ============================================
// Alumnos


// desbloquear un logro
export const desbloquearLogroSchema = z.object({
  logro_id: z.coerce.number().int().positive('ID de logro inválido')
});

// actualizar progreso
export const actualizarProgresoSchema = z.object({
  logro_id: z.coerce.number().int().positive('ID de logro inválido'),
  progreso: z.coerce.number()
    .min(0, 'El progreso mínimo es 0')
    .max(100, 'El progreso máximo es 100')
});