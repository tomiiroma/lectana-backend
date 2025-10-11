import { z } from 'zod';


export const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear respuesta
export const crearRespuestaSchema = z.object({
  respuesta: z.string().min(1, 'La respuesta es requerida'),
  es_correcta: z.boolean(),
  pregunta_actividad_id_pregunta_actividad: z.number().int().positive('ID de pregunta debe ser positivo')
});

// Schema para crear múltiples respuestas
export const crearRespuestasSchema = z.object({
  pregunta_actividad_id_pregunta_actividad: z.number().int().positive('ID de pregunta debe ser positivo'),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).min(1, 'Debe enviar al menos una respuesta')
});

// Schema para actualizar respuesta
export const actualizarRespuestaSchema = z.object({
  respuesta: z.string().min(1).optional(),
  es_correcta: z.boolean().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });