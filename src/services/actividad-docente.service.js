import { supabaseAdmin } from '../config/supabase.js';
import { crearPreguntasActividad, eliminarPreguntasActividad } from './pregunta_actividad.service.js';
import { crearRespuestasActividad } from './respuesta_actividad.service.js';

// Verificar que el docente tiene acceso a las aulas
async function verificarAccesoAulas(docenteId, aulasIds) {
  const { data: aulasDocente, error } = await supabaseAdmin
    .from('aula')
    .select('id_aula')
    .eq('docente_id_docente', docenteId)
    .in('id_aula', aulasIds);

  if (error) throw new Error(error.message);
  
  const aulasAccesibles = aulasDocente.map(aula => aula.id_aula);
  const aulasNoAccesibles = aulasIds.filter(id => !aulasAccesibles.includes(id));
  
  if (aulasNoAccesibles.length > 0) {
    throw new Error(`No tienes acceso a las aulas: ${aulasNoAccesibles.join(', ')}`);
  }
  
  return true;
}

// Verificar que el docente tiene acceso a una actividad
async function verificarAccesoActividad(actividadId, docenteId) {
  const { data: actividad, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      id_actividad,
      actividad_aula(
        aula:aula_id_aula(
          docente_id_docente
        )
      )
    `)
    .eq('id_actividad', actividadId)
    .single();

  if (error) throw new Error(error.message);
  
  const tieneAcceso = actividad.actividad_aula.some(aa => 
    aa.aula.docente_id_docente === docenteId
  );
  
  if (!tieneAcceso) {
    throw new Error('No tienes acceso a esta actividad');
  }
  
  return true;
}

// Crear actividad completa como docente
export async function crearActividadCompleta({ fecha_entrega, descripcion, tipo, cuento_id_cuento, aulas_ids, preguntas }, docenteId) {
  try {
    // 1. Verificar acceso a las aulas
    await verificarAccesoAulas(docenteId, aulas_ids);

    // 2. Validar según el tipo de actividad
    if (tipo === 'multiple_choice') {
      preguntas.forEach((pregunta, index) => {
        if (!pregunta.respuestas || pregunta.respuestas.length === 0) {
          throw new Error(`La pregunta ${index + 1} debe tener al menos una respuesta para actividades de opción múltiple`);
        }
        const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
        if (!tieneRespuestaCorrecta) {
          throw new Error(`La pregunta ${index + 1} debe tener al menos una respuesta correcta`);
        }
      });
    } else if (tipo === 'respuesta_abierta') {
      preguntas.forEach((pregunta, index) => {
        if (pregunta.respuestas && pregunta.respuestas.length > 0) {
          const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
          if (tieneRespuestaCorrecta) {
            throw new Error(`La pregunta ${index + 1} no puede tener respuestas marcadas como correctas en actividades de respuesta abierta`);
          }
        }
      });
    }

    // 3. Crear la actividad
    const fecha_publicacion = new Date().toISOString();
    
    const { data: actividad, error: actividadError } = await supabaseAdmin
      .from('actividad')
      .insert([{ 
        fecha_entrega, 
        fecha_publicacion, 
        tipo, 
        descripcion,
        cuento_id_cuento
      }])
      .select(`
        *,
        cuento:cuento_id_cuento(id_cuento, titulo)
      `)
      .single();

    if (actividadError) throw new Error(actividadError.message);

    // 4. Crear las preguntas
    const preguntasCreadas = await crearPreguntasActividad(actividad.id_actividad, preguntas);

    // 5. Crear las respuestas
    const preguntasConRespuestas = [];
    for (const pregunta of preguntasCreadas) {
      const preguntaOriginal = preguntas.find(p => p.enunciado === pregunta.enunciado);
      if (preguntaOriginal && preguntaOriginal.respuestas && preguntaOriginal.respuestas.length > 0) {
        const respuestas = await crearRespuestasActividad(pregunta.id_pregunta_actividad, preguntaOriginal.respuestas);
        preguntasConRespuestas.push({
          ...pregunta,
          respuestas
        });
      } else {
        preguntasConRespuestas.push(pregunta);
      }
    }

    // 6. Asignar actividad a las aulas
    const asignaciones = aulas_ids.map(aula_id => ({
      actividad_id_actividad: actividad.id_actividad,
      aula_id_aula: aula_id
    }));

    const { data: asignacionesCreadas, error: asignacionError } = await supabaseAdmin
      .from('actividad_aula')
      .insert(asignaciones)
      .select(`
        *,
        aula:aula_id_aula(id_aula, nombre_aula)
      `);

    if (asignacionError) throw new Error(asignacionError.message);

    // 7. Retornar actividad completa
    return {
      ...actividad,
      preguntas: preguntasConRespuestas,
      aulas_asignadas: asignacionesCreadas
    };
  } catch (error) {
    throw new Error(`Error al crear actividad completa: ${error.message}`);
  }
}

// Obtener actividades del docente
export async function obtenerActividadesDeDocente(docenteId) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente_id_docente
        )
      ),
      pregunta_actividad(
        id_pregunta_actividad,
        enunciado,
        respuesta_actividad(
          id_respuesta_actividad,
          respuestas,
          respuesta_correcta
        )
      )
    `)
    .is('deleted_at', null)
    .eq('actividad_aula.aula.docente_id_docente', docenteId)
    .order('fecha_publicacion', { ascending: false });
  
  if (error) throw new Error(error.message);
  
  // Agregar resultados_actividad con estadísticas a cada actividad
  const actividadesConResultados = await Promise.all(
    data.map(async (actividad) => {
      // Obtener resultados de esta actividad
      const { data: resultados, error: resultadosError } = await supabaseAdmin
        .from('resultados_actividad')
        .select('*')
        .eq('id_actividad', actividad.id_actividad);
      
      if (resultadosError) {
        console.error(`Error al obtener resultados para actividad ${actividad.id_actividad}:`, resultadosError);
        // Continuar sin resultados si hay error
      }
      
      // Obtener total de estudiantes en aulas asignadas
      const aulasIds = actividad.actividad_aula?.map(aa => aa.aula?.id_aula).filter(Boolean) || [];
      let totalEstudiantes = 0;
      
      if (aulasIds.length > 0) {
        const { count, error: countError } = await supabaseAdmin
          .from('alumno_has_aula')
          .select('*', { count: 'exact', head: true })
          .in('aula_id_aula', aulasIds);
        
        if (!countError) {
          totalEstudiantes = count || 0;
        }
      }
      
      // Calcular estadísticas
      const resultadosData = resultados || [];
      const completadas = resultadosData.filter(r => r.estado === 'completada').length;
      const corregidas = resultadosData.filter(r => r.sin_corregir === 0).length;
      const sinCorregir = resultadosData.filter(r => r.sin_corregir > 0).length;
      
      // Calcular nota promedio
      const notas = resultadosData.map(r => r.porcentaje).filter(n => n !== null && n !== undefined);
      const notaPromedio = notas.length > 0 
        ? notas.reduce((sum, nota) => sum + nota, 0) / notas.length 
        : 0;
      
      return {
        ...actividad,
        resultados_actividad: {
          sin_corregir: sinCorregir,
          total_estudiantes: totalEstudiantes,
          completadas: completadas,
          corregidas: corregidas,
          nota_promedio: Math.round(notaPromedio * 100) / 100
        }
      };
    })
  );
  
  return actividadesConResultados;
}

// Obtener actividad específica del docente
export async function obtenerActividadPorIdDocente(actividadId, docenteId) {
  // Verificar acceso
  await verificarAccesoActividad(actividadId, docenteId);

  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente_id_docente
        )
      ),
      pregunta_actividad(
        id_pregunta_actividad,
        enunciado,
        respuesta_actividad(
          id_respuesta_actividad,
          respuestas,
          respuesta_correcta
        )
      )
    `)
    .eq('id_actividad', actividadId)
    .is('deleted_at', null)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar actividad completa del docente
export async function actualizarActividadCompletaConPreguntas(actividadId, { fecha_entrega, descripcion, tipo, cuento_id_cuento, aulas_ids, preguntas }, docenteId) {
  try {
    // 1. Verificar acceso
    await verificarAccesoActividad(actividadId, docenteId);

    // 2. Validar aulas si se proporcionan
    if (aulas_ids && aulas_ids.length > 0) {
      await verificarAccesoAulas(docenteId, aulas_ids);
    }

    // 3. Validar preguntas si se proporcionan
    if (preguntas && preguntas.length > 0) {
      if (tipo === 'multiple_choice') {
        preguntas.forEach((pregunta, index) => {
          if (!pregunta.respuestas || pregunta.respuestas.length === 0) {
            throw new Error(`La pregunta ${index + 1} debe tener al menos una respuesta para actividades de opción múltiple`);
          }
          const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
          if (!tieneRespuestaCorrecta) {
            throw new Error(`La pregunta ${index + 1} debe tener al menos una respuesta correcta`);
          }
        });
      } else if (tipo === 'respuesta_abierta') {
        preguntas.forEach((pregunta, index) => {
          if (pregunta.respuestas && pregunta.respuestas.length > 0) {
            const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
            if (tieneRespuestaCorrecta) {
              throw new Error(`La pregunta ${index + 1} no puede tener respuestas marcadas como correctas en actividades de respuesta abierta`);
            }
          }
        });
      }
    }

    // 4. Actualizar la actividad básica
    const updates = {};
    if (fecha_entrega !== undefined) updates.fecha_entrega = fecha_entrega;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (tipo !== undefined) updates.tipo = tipo;
    if (cuento_id_cuento !== undefined) updates.cuento_id_cuento = cuento_id_cuento;

    if (Object.keys(updates).length > 0) {
      const { data: actividadActualizada, error: updateError } = await supabaseAdmin
        .from('actividad')
        .update(updates)
        .eq('id_actividad', actividadId)
        .select(`
          *,
          cuento:cuento_id_cuento(id_cuento, titulo)
        `)
        .single();

      if (updateError) throw new Error(updateError.message);
    }

    // 5. Actualizar aulas si se proporcionan
    if (aulas_ids && aulas_ids.length > 0) {
      // Eliminar asignaciones existentes
      await supabaseAdmin
        .from('actividad_aula')
        .delete()
        .eq('actividad_id_actividad', actividadId);

      // Crear nuevas asignaciones
      const asignaciones = aulas_ids.map(aula_id => ({
        actividad_id_actividad: actividadId,
        aula_id_aula: aula_id
      }));

      const { error: asignacionError } = await supabaseAdmin
        .from('actividad_aula')
        .insert(asignaciones);

      if (asignacionError) throw new Error(asignacionError.message);
    }

    // 6. Actualizar preguntas si se proporcionan
    if (preguntas && preguntas.length > 0) {
      // Eliminar preguntas existentes
      await eliminarPreguntasActividad(actividadId);

      // Crear nuevas preguntas
      const preguntasCreadas = await crearPreguntasActividad(actividadId, preguntas);

      // Crear respuestas
      const preguntasConRespuestas = [];
      for (const pregunta of preguntasCreadas) {
        const preguntaOriginal = preguntas.find(p => p.enunciado === pregunta.enunciado);
        if (preguntaOriginal && preguntaOriginal.respuestas && preguntaOriginal.respuestas.length > 0) {
          const respuestas = await crearRespuestasActividad(pregunta.id_pregunta_actividad, preguntaOriginal.respuestas);
          preguntasConRespuestas.push({
            ...pregunta,
            respuestas
          });
        } else {
          preguntasConRespuestas.push(pregunta);
        }
      }

      return {
        ...actividadActualizada,
        preguntas: preguntasConRespuestas
      };
    }

    return actividadActualizada;
  } catch (error) {
    throw new Error(`Error al actualizar actividad completa: ${error.message}`);
  }
}

// Eliminar actividad del docente
export async function eliminarActividad(actividadId, docenteId) {
  // Verificar acceso
  await verificarAccesoActividad(actividadId, docenteId);

  const { error } = await supabaseAdmin
    .from('actividad')
    .delete()
    .eq('id_actividad', actividadId);
  
  if (error) throw new Error(error.message);
}

// Asignar actividad a aulas del docente
export async function asignarActividadAAulasDocente(actividadId, aulasIds, docenteId) {
  // Verificar acceso a la actividad
  await verificarAccesoActividad(actividadId, docenteId);
  
  // Verificar acceso a las aulas
  await verificarAccesoAulas(docenteId, aulasIds);

  // Eliminar asignaciones existentes
  await supabaseAdmin
    .from('actividad_aula')
    .delete()
    .eq('actividad_id_actividad', actividadId);

  // Insertar nuevas asignaciones
  const asignaciones = aulasIds.map(aula_id => ({
    actividad_id_actividad: actividadId,
    aula_id_aula: aula_id
  }));

  const { data, error } = await supabaseAdmin
    .from('actividad_aula')
    .insert(asignaciones)
    .select(`
      *,
      aula:aula_id_aula(id_aula, nombre_aula)
    `);
  
  if (error) throw new Error(error.message);
  return data;
}

// Obtener actividades de un aula específica del docente
export async function obtenerActividadesDeAulaDocente(aulaId, docenteId) {
  // Verificar que el docente tiene acceso al aula
  const { data: aula, error: aulaError } = await supabaseAdmin
    .from('aula')
    .select('id_aula, docente_id_docente')
    .eq('id_aula', aulaId)
    .eq('docente_id_docente', docenteId)
    .single();

  if (aulaError) throw new Error('No tienes acceso a este aula');

  const { data, error } = await supabaseAdmin
    .from('actividad_aula')
    .select(`
      *,
      actividad:actividad_id_actividad(
        id_actividad,
        fecha_entrega,
        fecha_publicacion,
        tipo,
        descripcion,
        cuento_id_cuento,
        cuento:cuento_id_cuento(id_cuento, titulo)
      ),
      aula:aula_id_aula(
        id_aula,
        nombre_aula
      )
    `)
    .eq('aula_id_aula', aulaId)
    .is('actividad.deleted_at', null)
    .order('fecha_asignacion', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}



