import { z } from 'zod';


export const crearLogroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().default(''),
  evento: z.enum(['registro', 'puntos', 'compras'], {
    errorMap: () => ({ message: 'Evento debe ser: registro, puntos o compras' })
  }),
  valor: z.preprocess(
    (val) => {
      if (val === 'registro') return 1;
      return val === '' || val === null || val === undefined ? 1 : Number(val);
    },
    z.number().int().min(1, 'El valor debe ser mínimo 1')
  )
}).refine((data) => {
  if (data.evento === 'registro' && data.valor !== 1) {
    return false;
  }
  return true;
}, {
  message: 'Los logros de tipo "registro" deben tener valor = 1',
  path: ['valor']
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

