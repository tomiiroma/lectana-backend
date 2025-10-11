import { z } from 'zod';


// Schema para crear actividad con cuento
export const crearActividadConCuentoSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo')
});


// Schema para actualizar actividad completa
export const crearActividadCompletaSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo'),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).optional() // Las respuestas son opcionales para respuesta_abierta
  })).min(1, 'Debe enviar al menos una pregunta')
}).refine((data) => {
  // Validación personalizada según el tipo
  if (data.tipo === 'multiple_choice') {
    // Para multiple_choice, todas las preguntas deben tener respuestas
    return data.preguntas.every(pregunta => 
      pregunta.respuestas && 
      pregunta.respuestas.length > 0 && 
      pregunta.respuestas.some(resp => resp.es_correcta)
    );
  }
  return true; // Para respuesta_abierta no hay restricciones adicionales
}, {
  message: 'Las actividades de opción múltiple requieren respuestas con al menos una correcta'
});


// Schema para actualizar actividad completa con preguntas
export const actualizarActividadCompletaConPreguntasSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1).optional(),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta']).optional(),
  cuento_id_cuento: z.number().int().positive().nullable().optional(),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).optional() // Las respuestas son opcionales para respuesta_abierta
  })).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' })
.refine((data) => {
  // Validación personalizada según el tipo si se proporcionan preguntas
  if (data.preguntas && data.tipo === 'multiple_choice') {
    return data.preguntas.every(pregunta => 
      pregunta.respuestas && 
      pregunta.respuestas.length > 0 && 
      pregunta.respuestas.some(resp => resp.es_correcta)
    );
  }
  return true;
}, {
  message: 'Las actividades de opción múltiple requieren respuestas con al menos una correcta'
});


export const actualizarActividadCompletaSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta']).optional(),
  descripcion: z.string().min(1).optional(),
  cuento_id_cuento: z.number().int().positive().nullable().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' });


// Schema para asignar aulas
export const asignarAulasSchema = z.object({
  aulas: z.array(z.number().int().positive('ID de aula debe ser positivo')).min(1, 'Debe enviar al menos un aula')
});