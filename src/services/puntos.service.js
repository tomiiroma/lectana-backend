import { supabaseAdmin } from '../config/supabase.js';



// Obtiene el id_alumno a partir del id_usuario
 
async function obtenerIdAlumnoPorUsuario(usuarioId) {
  const { data: alumno, error } = await supabaseAdmin
    .from('alumno')
    .select('id_alumno')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  return alumno.id_alumno;
}


// Inicia al alumno con 10 pts

export async function inicializarPuntosAlumno(usuarioId, puntosIniciales = 10) {
  console.log(`Inicializando puntos para usuario ${usuarioId}`);
  
  try {
    
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Usuario ID: ${usuarioId} → Alumno ID: ${alumnoId}`);

    
    const { data: puntosExistentes } = await supabaseAdmin
      .from('puntos_alumno')
      .select('*')
      .eq('alumno_id_alumno', alumnoId)
      .single();

    if (puntosExistentes) {
      console.log(`ℹEl alumno ${alumnoId} ya tiene puntos registrados`);
      return {
        puntos: puntosExistentes,
        mensaje: 'Puntos ya existentes'
      };
    }

   
    const { data: nuevosPuntos, error } = await supabaseAdmin
      .from('puntos_alumno')
      .insert({
        alumno_id_alumno: alumnoId,
        puntos: puntosIniciales
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear puntos:', error);
      throw new Error(`Error al crear puntos iniciales: ${error.message}`);
    }

    console.log(`Puntos iniciales creados: ${puntosIniciales} puntos para alumno ${alumnoId}`);
    
    return {
      puntos: nuevosPuntos,
      mensaje: `Se asignaron ${puntosIniciales} puntos iniciales`
    };

  } catch (error) {
    console.error('Error en inicializarPuntosAlumno:', error);
    return {
      puntos: null,
      mensaje: 'Error al inicializar puntos'
    };
  }
}


export async function obtenerPuntosPorUsuario(usuarioId) {
  console.log(`Obteniendo puntos para usuario ${usuarioId}`);
  
  try {
  
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Usuario ID: ${usuarioId} → Alumno ID: ${alumnoId}`);

    
    const { data: puntos, error } = await supabaseAdmin
      .from('puntos_alumno')
      .select('*')
      .eq('alumno_id_alumno', alumnoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`ℹNo se encontraron puntos para el alumno ${alumnoId}`);
        return null;
      }
      throw new Error(`Error al obtener puntos: ${error.message}`);
    }

    console.log(`Puntos obtenidos: ${puntos.puntos} puntos`);
    return puntos;

  } catch (error) {
    console.error('Error en obtenerPuntosPorUsuario:', error);
    throw error;
  }
}


export async function obtenerPuntosAlumno(id_alumno){
    const { data, error } = await supabaseAdmin
    .from('puntos_alumno')
    .select()
    .eq('alumno_id_alumno', id_alumno)

    if(error){
        throw new Error (error.message)
    }
    return data;
}

export async function obtenerPuntos(id_alumno, puntosASumar) { 
    const { data: alumnoData, error: errorSelect } = await supabaseAdmin
        .from('puntos_alumno')
        .select('puntos')
        .eq('alumno_id_alumno', id_alumno)
        .single();

    if (errorSelect) {
        throw new Error(`Error al obtener puntos: ${errorSelect.message}`);
    }

    if (!alumnoData) {
        throw new Error('Alumno no encontrado');
    }

    const puntosActuales = alumnoData.puntos;
    const nuevosPuntos = puntosActuales + puntosASumar; 

    const { data, error: errorUpdate } = await supabaseAdmin
        .from('puntos_alumno')
        .update({ puntos: nuevosPuntos })
        .eq('alumno_id_alumno', id_alumno)
        .select()
        .single();

    if (errorUpdate) {
        throw new Error(`Error al actualizar puntos: ${errorUpdate.message}`);
    }

    return data;
}