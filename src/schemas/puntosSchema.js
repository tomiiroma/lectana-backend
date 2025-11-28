import { z } from 'zod';

export const crearPuntosInicialSchema = z.object({
  alumno_id_alumno: z.number().int().positive(),
  puntos: z.number().int().min(0).default(10)
});

export const actualizarPuntosSchema = z.object({
  puntos: z.number().int().min(0)
});

export const obtenerPuntosPorAlumnoSchema = z.object({
  alumno_id: z.coerce.number().int().positive()
});