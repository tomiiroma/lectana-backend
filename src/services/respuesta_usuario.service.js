import { supabaseAdmin } from '../config/supabase.js';

// Crear respuesta de usuario
export async function crearRespuestaUsuario({ 
  respuesta_texto, 
  pregunta_actividad_id_pregunta_actividad, 
  alumno_id_alumno, 
  respuesta_actividad_id_respuesta_actividad 
}) {
  const fecha_respuesta = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .insert([{ 
      respuesta_texto, 
      fecha_respuesta, 
      pregunta_actividad_id_pregunta_actividad, 
      alumno_id_alumno, 
      respuesta_actividad_id_respuesta_actividad 
    }])
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener respuestas de un alumno para una actividad
export async function obtenerRespuestasUsuarioActividad(alumno_id_alumno, actividad_id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .select(`
      *,
      pregunta_actividad:pregunta_actividad_id_pregunta_actividad(
        id_pregunta_actividad,
        enunciado
      ),
      respuesta_actividad:respuesta_actividad_id_respuesta_actividad(
        id_respuesta_actividad,
        respuesta,
        es_correcta
      )
    `)
    .eq('alumno_id_alumno', alumno_id_alumno)
    .eq('pregunta_actividad.actividad_id_actividad', actividad_id_actividad)
    .order('fecha_respuesta', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener todas las respuestas de una pregunta específica
export async function obtenerRespuestasPregunta(pregunta_actividad_id_pregunta_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .select(`
      *,
      alumno:alumno_id_alumno(
        id_alumno,
        usuario:usuario_id_usuario(
          nombre,
          apellido
        )
      ),
      respuesta_actividad:respuesta_actividad_id_respuesta_actividad(
        id_respuesta_actividad,
        respuesta,
        es_correcta
      )
    `)
    .eq('pregunta_actividad_id_pregunta_actividad', pregunta_actividad_id_pregunta_actividad)
    .order('fecha_respuesta', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener respuesta de usuario por ID
export async function obtenerRespuestaUsuarioPorId(id_respuesta_usuario) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .select(`
      *,
      pregunta_actividad:pregunta_actividad_id_pregunta_actividad(
        id_pregunta_actividad,
        enunciado
      ),
      alumno:alumno_id_alumno(
        id_alumno,
        usuario:usuario_id_usuario(
          nombre,
          apellido
        )
      ),
      respuesta_actividad:respuesta_actividad_id_respuesta_actividad(
        id_respuesta_actividad,
        respuesta,
        es_correcta
      )
    `)
    .eq('id_respuesta_usuario', id_respuesta_usuario)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar respuesta de usuario
export async function actualizarRespuestaUsuario(id_respuesta_usuario, updates) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .update(updates)
    .eq('id_respuesta_usuario', id_respuesta_usuario)
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Eliminar respuesta de usuario
export async function eliminarRespuestaUsuario(id_respuesta_usuario) {
  const { error } = await supabaseAdmin
    .from('respuesta_usuario')
    .delete()
    .eq('id_respuesta_usuario', id_respuesta_usuario);
  
  if (error) throw new Error(error.message);
}

// Verificar si un alumno ya respondió una pregunta
export async function verificarRespuestaExistente(alumno_id_alumno, pregunta_actividad_id_pregunta_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .select('id_respuesta_usuario')
    .eq('alumno_id_alumno', alumno_id_alumno)
    .eq('pregunta_actividad_id_pregunta_actividad', pregunta_actividad_id_pregunta_actividad)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  
  return data !== null;
}

// Obtener estadísticas de respuestas de una actividad
export async function obtenerEstadisticasActividad(actividad_id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('respuesta_usuario')
    .select(`
      *,
      pregunta_actividad:pregunta_actividad_id_pregunta_actividad(
        id_pregunta_actividad,
        enunciado
      ),
      respuesta_actividad:respuesta_actividad_id_respuesta_actividad(
        es_correcta
      )
    `)
    .eq('pregunta_actividad.actividad_id_actividad', actividad_id_actividad);
  
  if (error) throw new Error(error.message);
  
  // Calcular estadísticas
  const totalRespuestas = data.length;
  const respuestasCorrectas = data.filter(r => r.respuesta_actividad?.es_correcta).length;
  const porcentajeCorrecto = totalRespuestas > 0 ? (respuestasCorrectas / totalRespuestas) * 100 : 0;
  
  return {
    total_respuestas: totalRespuestas,
    respuestas_correctas: respuestasCorrectas,
    porcentaje_correcto: Math.round(porcentajeCorrecto * 100) / 100,
    respuestas: data
  };
}

//NUEVAS FUNCIONES

export async function crearRespuestaAbierta(respuesta_texto, id_pregunta){

  if(!respuesta_texto, !id_pregunta){
    console.log("Faltan datos")
  }

  const {data, error} = await supabaseAdmin
  .from('respuesta_usuario')
  .insert({respuesta_texto: respuesta_texto, pregunta_actividad_id_pregunta_actividad: id_pregunta})
  .select()

   if(error){
      throw new Error("Error al crear respuesta")
      console.log("Error", error.message)
    }

    return data;

}
