import { z } from 'zod';


export const idSchema = z.object({ id: z.coerce.number().int().positive() });

// Schema para crear pregunta
export const crearPreguntaSchema = z.object({
  enunciado: z.string().min(1, 'El enunciado es requerido'),
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo')
});

// Schema para crear múltiples preguntas
export const crearPreguntasSchema = z.object({
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo'),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido')
  })).min(1, 'Debe enviar al menos una pregunta')
});

// Schema para actualizar pregunta
export const actualizarPreguntaSchema = z.object({
  enunciado: z.string().min(1).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });

// Schema para agregar pregunta con respuestas
export const agregarPreguntaSchema = z.object({
  actividad_id_actividad: z.number().int().positive('ID de actividad debe ser positivo'),
  enunciado: z.string().min(1, 'El enunciado es requerido'),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).optional() // Las respuestas son opcionales para respuesta_abierta
});

// Schema para actualizar pregunta completa
export const actualizarPreguntaCompletaSchema = z.object({
  enunciado: z.string().min(1).optional(),
  respuestas: z.array(z.object({
    respuesta: z.string().min(1, 'La respuesta es requerida'),
    es_correcta: z.boolean()
  })).optional() // Las respuestas son opcionales para respuesta_abierta
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });
