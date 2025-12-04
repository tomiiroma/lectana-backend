import { supabaseAdmin } from '../config/supabase.js';

// Crear respuesta para una pregunta
export async function crearRespuestaActividad({ respuesta, es_correcta, pregunta_actividad_id_pregunta_actividad }) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_actividad')
    .insert([{ 
      respuesta, 
      es_correcta, 
      pregunta_actividad_id_pregunta_actividad 
    }])
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Crear múltiples respuestas para una pregunta
export async function crearRespuestasActividad(pregunta_actividad_id_pregunta_actividad, respuestas) {
  const respuestasData = respuestas.map(respuesta => ({
    respuestas: [respuesta.respuesta],
    es_correcta: respuesta.es_correcta,
    pregunta_actividad_id_pregunta_actividad
  }));

  const { data, error } = await supabaseAdmin
    .from('respuesta_actividad')
    .insert(respuestasData)
    .select('*');
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener todas las respuestas de una pregunta
export async function obtenerRespuestasActividad(pregunta_actividad_id_pregunta_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_actividad')
    .select('*')
    .eq('pregunta_actividad_id_pregunta_actividad', pregunta_actividad_id_pregunta_actividad)
    .order('id_respuesta_actividad', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener respuesta por ID
export async function obtenerRespuestaPorId(id_respuesta_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_actividad')
    .select('*')
    .eq('id_respuesta_actividad', id_respuesta_actividad)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar respuesta
export async function actualizarRespuestaActividad(id_respuesta_actividad, updates) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_actividad')
    .update(updates)
    .eq('id_respuesta_actividad', id_respuesta_actividad)
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Eliminar respuesta
export async function eliminarRespuestaActividad(id_respuesta_actividad) {
  const { error } = await supabaseAdmin
    .from('respuesta_actividad')
    .delete()
    .eq('id_respuesta_actividad', id_respuesta_actividad);
  
  if (error) throw new Error(error.message);
}

// Eliminar todas las respuestas de una pregunta
export async function eliminarRespuestasActividad(pregunta_actividad_id_pregunta_actividad) {
  const { error } = await supabaseAdmin
    .from('respuesta_actividad')
    .delete()
    .eq('pregunta_actividad_id_pregunta_actividad', pregunta_actividad_id_pregunta_actividad);
  
  if (error) throw new Error(error.message);
}


//NUEVAS FUNCIONES

export async function crearRespuestaParaActividad(respuestas, respuesta_correcta, id_pregunta ){
    if( !id_pregunta || !respuestas || respuesta_correcta === undefined){
      throw new Error("Faltan campos")
    }

    const {data, error} = await supabaseAdmin
    .from('respuesta_actividad')
    .insert({respuestas: respuestas, respuesta_correcta: respuesta_correcta, pregunta_actividad_id_pregunta_actividad: id_pregunta})
    .select('*')
    .single()

    if(error){
      throw new Error(error.message)
    }

    return data;
}