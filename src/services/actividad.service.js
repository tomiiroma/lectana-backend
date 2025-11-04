import { supabaseAdmin } from '../config/supabase.js';
import { crearPreguntasActividad } from './pregunta_actividad.service.js';
import { crearRespuestasActividad } from './respuesta_actividad.service.js';

// Crear actividad basada en cuento (con cuento requerido)
export async function crearActividadConCuento({ fecha_entrega, descripcion, tipo, cuento_id_cuento }) {
  const fecha_publicacion = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
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
  if (error) throw new Error(error.message);
  return data;
}

// Crear actividad completa con preguntas y respuestas
export async function crearActividadCompleta({ fecha_entrega, descripcion, tipo, cuento_id_cuento, preguntas }) {
  try {
    // 1. Validar según el tipo de actividad
    if (tipo === 'multiple_choice') {
      // Para multiple_choice, validar que todas las preguntas tengan respuestas
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
      // Para respuesta_abierta, las preguntas no necesitan respuestas predefinidas
      // Pero pueden tener respuestas de ejemplo o guía
      preguntas.forEach((pregunta, index) => {
        if (pregunta.respuestas && pregunta.respuestas.length > 0) {
          // Si tiene respuestas, deben ser solo de ejemplo (es_correcta: false)
          const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
          if (tieneRespuestaCorrecta) {
            throw new Error(`La pregunta ${index + 1} no puede tener respuestas marcadas como correctas en actividades de respuesta abierta`);
          }
        }
      });
    }

    // 2. Crear la actividad
    const actividad = await crearActividadConCuento({ 
      fecha_entrega, 
      descripcion, 
      tipo, 
      cuento_id_cuento 
    });

    // 3. Crear las preguntas
    const preguntasCreadas = await crearPreguntasActividad(actividad.id_actividad, preguntas);

    // 4. Crear las respuestas solo si es multiple_choice o si hay respuestas de ejemplo
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

    // 5. Retornar actividad completa
    return {
      ...actividad,
      preguntas: preguntasConRespuestas
    };
  } catch (error) {
    throw new Error(`Error al crear actividad completa: ${error.message}`);
  }
}

// Función eliminada: asignarDocenteAActividad
// Ya no es necesaria porque el docente se obtiene a través del aula

// Obtener todas las actividades
export async function obtenerTodasLasActividades() {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente:docente_id_docente(
            id_docente,
            usuario:usuario_id_usuario(nombre, apellido)
          )
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
    .order('fecha_publicacion', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Obtener actividad por ID
export async function obtenerActividadPorId(id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente:docente_id_docente(
            id_docente,
            usuario:usuario_id_usuario(nombre, apellido)
          )
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
    .eq('id_actividad', id_actividad)
    .is('deleted_at', null)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar actividad completa
export async function actualizarActividadCompleta(id_actividad, updates) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .update(updates)
    .eq('id_actividad', id_actividad)
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente:docente_id_docente(
            id_docente,
            usuario:usuario_id_usuario(nombre, apellido)
          )
        )
      )
    `)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar actividad completa con preguntas y respuestas
export async function actualizarActividadCompletaConPreguntas(id_actividad, { fecha_entrega, descripcion, tipo, cuento_id_cuento, preguntas }) {
  try {
    // 1. Validar según el tipo de actividad
    if (preguntas && preguntas.length > 0) {
      if (tipo === 'multiple_choice') {
        // Para multiple_choice, validar que todas las preguntas tengan respuestas
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
        // Para respuesta_abierta, las preguntas no necesitan respuestas predefinidas
        preguntas.forEach((pregunta, index) => {
          if (pregunta.respuestas && pregunta.respuestas.length > 0) {
            // Si tiene respuestas, deben ser solo de ejemplo (es_correcta: false)
            const tieneRespuestaCorrecta = pregunta.respuestas.some(resp => resp.es_correcta);
            if (tieneRespuestaCorrecta) {
              throw new Error(`La pregunta ${index + 1} no puede tener respuestas marcadas como correctas en actividades de respuesta abierta`);
            }
          }
        });
      }
    }

    // 2. Actualizar la actividad básica
    const actividadActualizada = await actualizarActividadCompleta(id_actividad, {
      fecha_entrega,
      descripcion,
      tipo,
      cuento_id_cuento
    });

    // 3. Eliminar preguntas existentes (esto elimina también las respuestas por cascada)
    await eliminarPreguntasActividad(id_actividad);

    // 4. Crear nuevas preguntas si se proporcionan
    if (preguntas && preguntas.length > 0) {
      const preguntasCreadas = await crearPreguntasActividad(id_actividad, preguntas);

      // 5. Crear respuestas solo si es multiple_choice o si hay respuestas de ejemplo
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

// Eliminar actividad
export async function eliminarActividad(id_actividad) {
  const { error: asignError } = await supabaseAdmin
    .from('actividad_aula')
    .delete()
    .eq('actividad_id_actividad', id_actividad);
  if (asignError) throw new Error(asignError.message);

  const { error } = await supabaseAdmin
    .from('actividad')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id_actividad', id_actividad);
  if (error) throw new Error(error.message);
}

// ===== MÉTODOS PARA RELACIÓN ACTIVIDAD-AULA =====

// Asignar actividad a múltiples aulas
export async function asignarActividadAAulas(id_actividad, aulas_ids) {
  // Primero eliminar asignaciones existentes
  await supabaseAdmin
    .from('actividad_aula')
    .delete()
    .eq('actividad_id_actividad', id_actividad);

  // Insertar nuevas asignaciones
  const asignaciones = aulas_ids.map(aula_id => ({
    actividad_id_actividad: id_actividad,
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

// Obtener aulas asignadas a una actividad
export async function obtenerAulasDeActividad(id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('actividad_aula')
    .select(`
      *,
      aula:aula_id_aula(id_aula, nombre_aula)
    `)
    .eq('actividad_id_actividad', id_actividad);
  
  if (error) throw new Error(error.message);
  return data;
}

// Remover actividad de un aula específica
export async function removerActividadDeAula(id_actividad, id_aula) {
  const { error } = await supabaseAdmin
    .from('actividad_aula')
    .delete()
    .eq('actividad_id_actividad', id_actividad)
    .eq('aula_id_aula', id_aula);
  
  if (error) throw new Error(error.message);
}

// Obtener actividades de un aula específica
export async function obtenerActividadesDeAula(id_aula) {
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
        nombre_aula,
        docente:docente_id_docente(
          id_docente,
          usuario:usuario_id_usuario(nombre, apellido)
        )
      )
    `)
    .eq('aula_id_aula', id_aula)
    .is('actividad.deleted_at', null)
    .order('fecha_asignacion', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar obtenerTodasLasActividades para incluir aulas
export async function obtenerTodasLasActividadesConAulas() {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente:docente_id_docente(
            id_docente,
            usuario:usuario_id_usuario(nombre, apellido)
          )
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
    .order('fecha_publicacion', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Actualizar obtenerActividadPorId para incluir aulas
export async function obtenerActividadPorIdConAulas(id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select(`
      *,
      cuento:cuento_id_cuento(id_cuento, titulo),
      actividad_aula(
        aula:aula_id_aula(
          id_aula, 
          nombre_aula,
          docente:docente_id_docente(
            id_docente,
            usuario:usuario_id_usuario(nombre, apellido)
          )
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
    .eq('id_actividad', id_actividad)
    .is('deleted_at', null)
    .single();
  if (error) throw new Error(error.message);
  return data;
}


export async function crearActividad(fecha_entrega, tipo, descripcion, id_cuento, id_usuario){
if (!fecha_entrega || !tipo || !id_cuento || !id_usuario) {
    throw new Error('Faltan parámetros requeridos');
  }


  const { data: docenteData, error: docenteError } = await supabaseAdmin
    .from('docente')
    .select('id_docente')
    .eq('usuario_id_usuario', id_usuario)
    .single();

  if (docenteError || !docenteData) {
    throw new Error('El docente no existe');
  }
    const fecha = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .insert({fecha_entrega: fecha_entrega, fecha_publicacion: fecha, tipo: tipo, descripcion: descripcion, cuento_id_cuento: id_cuento, docente_id_docente: docenteData.id_docente})
    .select('*')
    .single()

    if(error){
      throw new Error(error.message)
    }
    return data
  }