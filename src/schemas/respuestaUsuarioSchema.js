import { z } from 'zod';


export const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear respuesta de usuario
export const crearRespuestaUsuarioSchema = z.object({
  respuesta_texto: z.string().min(1, 'La respuesta es requerida'),
  pregunta_actividad_id_pregunta_actividad: z.number().int().positive('ID de pregunta debe ser positivo'),
  alumno_id_alumno: z.number().int().positive('ID de alumno debe ser positivo'),
  respuesta_actividad_id_respuesta_actividad: z.number().int().positive('ID de respuesta debe ser positivo')
});

// Schema para actualizar respuesta de usuario
export const actualizarRespuestaUsuarioSchema = z.object({
  respuesta_texto: z.string().min(1).optional(),
  respuesta_actividad_id_respuesta_actividad: z.number().int().positive().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });