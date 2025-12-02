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
        respuestas,
        respuesta_correcta
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

// Obtener estadísticas de respuestas de una actividad basadas en resultados_actividad
export async function obtenerEstadisticasActividad(actividad_id_actividad) {
  // 1. Obtener todos los resultados de la actividad
  const { data: resultados, error: resultadosError } = await supabaseAdmin
    .from('resultados_actividad')
    .select('*')
    .eq('id_actividad', actividad_id_actividad);
  
  if (resultadosError) throw new Error(resultadosError.message);
  
  // 2. Obtener total de estudiantes en aulas asignadas a la actividad
  const { data: actividadAulas, error: actividadAulasError } = await supabaseAdmin
    .from('actividad_aula')
    .select(`
      aula:aula_id_aula(
        id_aula
      )
    `)
    .eq('actividad_id_actividad', actividad_id_actividad);
  
  if (actividadAulasError) throw new Error(actividadAulasError.message);
  
  // Obtener IDs de aulas
  const aulasIds = actividadAulas?.map(aa => aa.aula?.id_aula).filter(Boolean) || [];
  
  // Contar estudiantes en esas aulas
  let totalEstudiantes = 0;
  if (aulasIds.length > 0) {
    const { count, error: countError } = await supabaseAdmin
      .from('alumno_has_aula')
      .select('*', { count: 'exact', head: true })
      .in('aula_id_aula', aulasIds);
    
    if (countError) throw new Error(countError.message);
    totalEstudiantes = count || 0;
  }
  
  // 3. Calcular estadísticas basadas en resultados_actividad
  const completadas = resultados?.filter(r => r.estado === 'completada').length || 0;
  const corregidas = resultados?.filter(r => r.sin_corregir === 0).length || 0;
  const pendientes = resultados?.filter(r => r.sin_corregir > 0).length || 0;
  
  // Calcular notas
  const notas = resultados?.map(r => r.porcentaje).filter(n => n !== null && n !== undefined) || [];
  const notaPromedio = notas.length > 0 
    ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length 
    : 0;
  const notaMaxima = notas.length > 0 ? Math.max(...notas) : 0;
  const notaMinima = notas.length > 0 ? Math.min(...notas) : 0;
  
  return {
    total_estudiantes: totalEstudiantes,
    completadas: completadas,
    corregidas: corregidas,
    pendientes: pendientes,
    nota_promedio: Math.round(notaPromedio * 100) / 100,
    nota_maxima: Math.round(notaMaxima * 100) / 100,
    nota_minima: Math.round(notaMinima * 100) / 100
  };
}

// Marcar actividad como completada
export async function marcarActividadCompletada(userId, actividadId) {
     
  const { data: alumnoData, error: errorId } = await supabaseAdmin
    .from("alumno")
    .select("id_alumno")
    .eq("usuario_id_usuario", userId)
    .single(); 

   if(errorId){
      throw new Error('Error al cambiar del aula: ' + error.message);
    } 
  
  // 1. Obtener o crear resultado_actividad para este alumno y actividad
    console.log(alumnoData.id_alumno)

  const { data: resultado, error: errorObtener } = await supabaseAdmin
    .from('resultados_actividad')
    .select('*')
    .eq('id_alumno', alumnoData.id_alumno)
    .eq('id_actividad', actividadId)
    .single();

  if (errorObtener && errorObtener.code !== 'PGRST116') {
    throw new Error(errorObtener.message);
  }

  // Si no existe, crearlo
  if (!resultado) {
    const { data: nuevoResultado, error: errorCrear } = await supabaseAdmin
      .from('resultados_actividad')
      .insert([{
        id_alumno: alumnoData.id_alumno,
        id_actividad: actividadId,
        estado: 'completada',
        sin_corregir: 0,
        porcentaje: 0
      }])
      .select('*')
      .single();

    if (errorCrear) throw new Error(errorCrear.message);
    return nuevoResultado;
  }

  // Si existe, actualizar el estado a completada
  const { data: actualizado, error: errorActualizar } = await supabaseAdmin
    .from('resultados_actividad')
    .update({ estado: 'completada' })
    .eq('id_resultado_actividad', resultado.id_resultado_actividad)
    .select('*')
    .single();

  if (errorActualizar) throw new Error(errorActualizar.message);
  return actualizado;
}

