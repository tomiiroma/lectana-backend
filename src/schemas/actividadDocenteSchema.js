import { z } from 'zod';

// Schema para crear actividad como docente
export const crearActividadDocenteSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo'),
  aulas_ids: z.array(z.number().int().positive()).min(1, 'Debe asignar al menos un aula'),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).optional()
  })).min(1, 'Debe enviar al menos una pregunta')
}).refine((data) => {
  if (data.tipo === 'multiple_choice') {
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

// Schema para actualizar actividad como docente
export const actualizarActividadDocenteSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1).optional(),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta']).optional(),
  cuento_id_cuento: z.number().int().positive().nullable().optional(),
  aulas_ids: z.array(z.number().int().positive()).optional(),
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).optional()
  })).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo' })
.refine((data) => {
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

// Schema para asignar aulas
export const asignarAulasDocenteSchema = z.object({
  aulas_ids: z.array(z.number().int().positive()).min(1, 'Debe enviar al menos un aula')
});

// Schema para crear actividad simple (sin preguntas)
export const crearActividadSimpleDocenteSchema = z.object({
  fecha_entrega: z.coerce.date().nullable().optional(),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  tipo: z.enum(['multiple_choice', 'respuesta_abierta'], {
    errorMap: () => ({ message: 'El tipo debe ser "multiple_choice" o "respuesta_abierta"' })
  }),
  cuento_id_cuento: z.number().int().positive('ID del cuento debe ser un número positivo'),
  aulas_ids: z.array(z.number().int().positive()).min(1, 'Debe asignar al menos un aula')
});

// Schema para agregar preguntas a actividad existente
export const agregarPreguntasActividadSchema = z.object({
  preguntas: z.array(z.object({
    enunciado: z.string().min(1, 'El enunciado es requerido'),
    respuestas: z.array(z.object({
      respuesta: z.string().min(1, 'La respuesta es requerida'),
      es_correcta: z.boolean()
    })).optional()
  })).min(1, 'Debe enviar al menos una pregunta')
});




