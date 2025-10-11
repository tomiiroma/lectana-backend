import { z } from 'zod';


export const crearAulaSchema = z.object({
  nombre_aula: z.string().min(1),
  grado: z.string().min(1),
});

export const actualizarAulaSchema = z.object({
  nombre_aula: z.string().min(1).optional(),
  grado: z.string().min(1).optional(),
  docente_id_docente: z.number().int().positive().optional(),
});

export const asignarCuentoSchema = z.object({
  cuento_id_cuento: z.number().int().positive(),
});

export const asignarAlumnoSchema = z.object({
  alumno_id_alumno: z.number().int().positive(),
});

export const asignarDocenteSchema = z.object({
  docente_id_docente: z.number().int().positive(),
});

export const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

export const asignarEstudiantesSchema = z.object({
  estudiantes_ids: z.array(z.number().int().positive()).min(0),
});

export const asignarCuentosSchema = z.object({
  cuentos_ids: z.array(z.number().int().positive()).min(0),
});