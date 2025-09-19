import { supabaseAdmin } from '../config/supabase.js';
import { crearRespuestasActividad, eliminarRespuestasActividad } from './respuesta_actividad.service.js';

// Crear pregunta para una actividad
export async function crearPreguntaActividad({ enunciado, actividad_id_actividad }) {
  const { data, error } = await supabaseAdmin
    .from('pregunta_actividad')
    .insert([{ 
      enunciado, 
      actividad_id_actividad 
    }])
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Crear múltiples preguntas para una actividad
export async function crearPreguntasActividad(actividad_id_actividad, preguntas) {
  const preguntasData = preguntas.map(pregunta => ({
    enunciado: pregunta.enunciado,
    actividad_id_actividad
  }));

  const { data, error } = await supabaseAdmin
    .from('pregunta_actividad')
    .insert(preguntasData)
    .select('*');
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener todas las preguntas de una actividad
export async function obtenerPreguntasActividad(actividad_id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('pregunta_actividad')
    .select(`
      *,
      respuesta_actividad(
        id_respuesta_actividad,
        respuesta,
        es_correcta
      )
    `)
    .eq('actividad_id_actividad', actividad_id_actividad)
    .order('id_pregunta_actividad', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener pregunta por ID
export async function obtenerPreguntaPorId(id_pregunta_actividad) {
  const { data, error } = await supabaseAdmin
    .from('pregunta_actividad')
    .select(`
      *,
      respuesta_actividad(
        id_respuesta_actividad,
        respuesta,
        es_correcta
      )
    `)
    .eq('id_pregunta_actividad', id_pregunta_actividad)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar pregunta
export async function actualizarPreguntaActividad(id_pregunta_actividad, updates) {
  const { data, error } = await supabaseAdmin
    .from('pregunta_actividad')
    .update(updates)
    .eq('id_pregunta_actividad', id_pregunta_actividad)
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Eliminar pregunta
export async function eliminarPreguntaActividad(id_pregunta_actividad) {
  const { error } = await supabaseAdmin
    .from('pregunta_actividad')
    .delete()
    .eq('id_pregunta_actividad', id_pregunta_actividad);
  
  if (error) throw new Error(error.message);
}

// Eliminar todas las preguntas de una actividad
export async function eliminarPreguntasActividad(actividad_id_actividad) {
  const { error } = await supabaseAdmin
    .from('pregunta_actividad')
    .delete()
    .eq('actividad_id_actividad', actividad_id_actividad);
  
  if (error) throw new Error(error.message);
}

// Agregar pregunta a actividad existente
export async function agregarPreguntaAActividad(actividad_id_actividad, { enunciado, respuestas }) {
  try {
    // 1. Obtener información de la actividad para validar el tipo
    const { data: actividad, error: actividadError } = await supabaseAdmin
      .from('actividad')
      .select('tipo')
      .eq('id_actividad', actividad_id_actividad)
      .single();

    if (actividadError) throw new Error(actividadError.message);

    // 2. Validar según el tipo de actividad
    if (actividad.tipo === 'multiple_choice') {
      if (!respuestas || respuestas.length === 0) {
        throw new Error('Las actividades de opción múltiple requieren al menos una respuesta');
      }
      const tieneRespuestaCorrecta = respuestas.some(resp => resp.es_correcta);
      if (!tieneRespuestaCorrecta) {
        throw new Error('Debe tener al menos una respuesta correcta');
      }
    } else if (actividad.tipo === 'respuesta_abierta') {
      if (respuestas && respuestas.length > 0) {
        // Si tiene respuestas, deben ser solo de ejemplo (es_correcta: false)
        const tieneRespuestaCorrecta = respuestas.some(resp => resp.es_correcta);
        if (tieneRespuestaCorrecta) {
          throw new Error('Las actividades de respuesta abierta no pueden tener respuestas marcadas como correctas');
        }
      }
    }

    // 3. Crear la pregunta
    const pregunta = await crearPreguntaActividad({ enunciado, actividad_id_actividad });

    // 4. Crear respuestas si se proporcionan
    if (respuestas && respuestas.length > 0) {
      const respuestasCreadas = await crearRespuestasActividad(pregunta.id_pregunta_actividad, respuestas);
      return {
        ...pregunta,
        respuestas: respuestasCreadas
      };
    }

    return pregunta;
  } catch (error) {
    throw new Error(`Error al agregar pregunta: ${error.message}`);
  }
}

// Actualizar pregunta con sus respuestas
export async function actualizarPreguntaCompleta(id_pregunta_actividad, { enunciado, respuestas }) {
  try {
    // 1. Obtener información de la actividad para validar el tipo
    const { data: preguntaData, error: preguntaError } = await supabaseAdmin
      .from('pregunta_actividad')
      .select(`
        actividad_id_actividad,
        actividad:tipo
      `)
      .eq('id_pregunta_actividad', id_pregunta_actividad)
      .single();

    if (preguntaError) throw new Error(preguntaError.message);

    // 2. Validar según el tipo de actividad
    if (preguntaData.actividad === 'multiple_choice') {
      if (!respuestas || respuestas.length === 0) {
        throw new Error('Las actividades de opción múltiple requieren al menos una respuesta');
      }
      const tieneRespuestaCorrecta = respuestas.some(resp => resp.es_correcta);
      if (!tieneRespuestaCorrecta) {
        throw new Error('Debe tener al menos una respuesta correcta');
      }
    } else if (preguntaData.actividad === 'respuesta_abierta') {
      if (respuestas && respuestas.length > 0) {
        // Si tiene respuestas, deben ser solo de ejemplo (es_correcta: false)
        const tieneRespuestaCorrecta = respuestas.some(resp => resp.es_correcta);
        if (tieneRespuestaCorrecta) {
          throw new Error('Las actividades de respuesta abierta no pueden tener respuestas marcadas como correctas');
        }
      }
    }

    // 3. Actualizar la pregunta
    const preguntaActualizada = await actualizarPreguntaActividad(id_pregunta_actividad, { enunciado });

    // 4. Eliminar respuestas existentes
    await eliminarRespuestasActividad(id_pregunta_actividad);

    // 5. Crear nuevas respuestas si se proporcionan
    if (respuestas && respuestas.length > 0) {
      const respuestasCreadas = await crearRespuestasActividad(id_pregunta_actividad, respuestas);
      return {
        ...preguntaActualizada,
        respuestas: respuestasCreadas
      };
    }

    return preguntaActualizada;
  } catch (error) {
    throw new Error(`Error al actualizar pregunta completa: ${error.message}`);
  }
}
