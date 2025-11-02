
import { supabaseAdmin } from '../config/supabase.js';
import { eliminarImagenLogro } from './logro.imagen.service.js';

// Admin

export async function crearLogro(data) {
  const { nombre, descripcion, url_imagen } = data;
  
  const { data: logro, error } = await supabaseAdmin
    .from('logros')
    .insert({
      nombre,
      descripcion: descripcion || '',
      url_imagen: url_imagen || null
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear logro: ${error.message}`);
  }

  return logro;
}

export async function obtenerLogroPorId(id) {
  const { data: logro, error } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', id)
    .single();

  if (error) {
    throw new Error('Logro no encontrado');
  }

  return logro;
}

export async function listarLogros() {
  const { data: logros, error } = await supabaseAdmin
    .from('logros')
    .select('*')
    .order('id_logros', { ascending: false });

  if (error) {
    throw new Error(`Error al listar logros: ${error.message}`);
  }

  return logros;
}

export async function actualizarLogro(id, data) {
  const { data: logro, error } = await supabaseAdmin
    .from('logros')
    .update(data)
    .eq('id_logros', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar logro: ${error.message}`);
  }

  return logro;
}

export async function eliminarLogro(id) {
 
  const { data: logro, error: logroError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', id)
    .single();

  if (logroError || !logro) {
    throw new Error('Logro no encontrado');
  }


  const { data: alumnosConLogro, error: alumnosError } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('alumno_id_alumno')
    .eq('logros_id_logros', id)
    .limit(1);

  if (alumnosError) {
    throw new Error(`Error al verificar alumnos: ${alumnosError.message}`);
  }

  if (alumnosConLogro && alumnosConLogro.length > 0) {
    throw new Error('No se puede eliminar el logro porque hay alumnos que ya lo han desbloqueado');
  }

 
  if (logro.url_imagen) {
    try {
      await eliminarImagenLogro(logro.url_imagen);
      console.log('Imagen eliminada de Storage');
    } catch (imagenError) {
      console.error('Error al eliminar imagen:', imagenError.message);
      
    }
  }

 
  const { error: deleteError } = await supabaseAdmin
    .from('logros')
    .delete()
    .eq('id_logros', id);

  if (deleteError) {
    throw new Error(`Error al eliminar logro: ${deleteError.message}`);
  }

  return { 
    message: 'Logro eliminado exitosamente',
    id_logros: id
  };
}

export async function verificarLogros(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      *,
      logro:logros_id_logros(*)
    `)
    .eq('alumno_id_alumno', usuarioId);

  if (error) {
    throw new Error(`Error al verificar logros: ${error.message}`);
  }

  return { verificados: data || [] };
}

export async function obtenerLogrosAlumno(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      *,
      logro:logros_id_logros(*)
    `)
    .eq('alumno_id_alumno', usuarioId);

  if (error) {
    throw new Error(`Error al obtener logros del alumno: ${error.message}`);
  }

  return data || [];
}


// Obtiene todos los alumnos que desbloquearon un logro específico -  Admin
 
export async function obtenerAlumnosDelLogro(logroId) {
  
  //alumnos que desbloquearon el logro
  const { data: alumnosLogro, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      fecha_desbloqueo,
      alumno:alumno_id_alumno (
        id_alumno,
        usuario:usuario_id_usuario (
          email
        )
      )
    `)
    .eq('logros_id_logros', logroId)
    .order('fecha_desbloqueo', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener alumnos del logro: ${error.message}`);
  }

  const alumnos = (alumnosLogro || []).map(item => ({
    id_alumno: item.alumno?.id_alumno,
    email: item.alumno?.usuario?.email || 'Sin email',
    fecha_desbloqueo: item.fecha_desbloqueo
  }));

  return alumnos;
}


// ============================================
// Alumnos



 // Desbloquea un logro para un alumno
 
export async function desbloquearLogro(usuarioId, logroId) {
  // Buscar el alumno
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from('alumno')
    .select('id_alumno')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (alumnoError || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  const alumnoId = alumno.id_alumno;

  // Verificar que el logro existe
  const { data: logro, error: logroError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', logroId)
    .single();

  if (logroError || !logro) {
    throw new Error('Logro no encontrado');
  }

  // Verificar si ya tiene el logro desbloqueado
  const { data: logroExistente } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('*')
    .eq('alumno_id_alumno', alumnoId)
    .eq('logros_id_logros', logroId)
    .single();

  if (logroExistente) {
    // Ya lo tiene desbloqueado
    return {
      yaDesbloqueado: true,
      logro,
      fecha_desbloqueo: logroExistente.fecha_desbloqueo,
      progreso: logroExistente.progreso
    };
  }

  // Desbloquear el logro 
  const { data: nuevoLogro, error: insertError } = await supabaseAdmin
    .from('alumno_has_logros')
    .insert({
      alumno_id_alumno: alumnoId,
      logros_id_logros: logroId,
      fecha_desbloqueo: new Date().toISOString(),
      progreso: 100
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(`Error al desbloquear logro: ${insertError.message}`);
  }

  return {
    yaDesbloqueado: false,
    logro,
    fecha_desbloqueo: nuevoLogro.fecha_desbloqueo,
    progreso: nuevoLogro.progreso
  };
}


 // Actualiza el progreso de un logro (0-100)
 // Si llega a 100, se desbloquea automáticamente
 
export async function actualizarProgresoLogro(alumnoId, logroId, progreso) {
  // Verificar que el logro existe
  const { data: logro, error: logroError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', logroId)
    .single();

  if (logroError || !logro) {
    throw new Error('Logro no encontrado');
  }

  // Verificar si el logro existe en alumno_has_logros
  const { data: logroExistente } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('*')
    .eq('alumno_id_alumno', alumnoId)
    .eq('logros_id_logros', logroId)
    .single();

  const esDesbloqueo = progreso >= 100;
  const recienDesbloqueado = esDesbloqueo && (!logroExistente || !logroExistente.fecha_desbloqueo);

  if (!logroExistente) {
    // No existe, crear nuevo registro
    const { data: nuevoProgreso, error: insertError } = await supabaseAdmin
      .from('alumno_has_logros')
      .insert({
        alumno_id_alumno: alumnoId,
        logros_id_logros: logroId,
        progreso: progreso,
        fecha_desbloqueo: esDesbloqueo ? new Date().toISOString() : null
      })
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Error al crear progreso: ${insertError.message}`);
    }

    return {
      nuevo: true,
      progreso: nuevoProgreso.progreso,
      desbloqueado: esDesbloqueo,
      logro,
      fecha_desbloqueo: nuevoProgreso.fecha_desbloqueo,
      recienDesbloqueado
    };
  }

  // Si existe el logro se actualiza el progreso
  const { data: progresoActualizado, error: updateError } = await supabaseAdmin
    .from('alumno_has_logros')
    .update({
      progreso: progreso,
      fecha_desbloqueo: recienDesbloqueado 
        ? new Date().toISOString() 
        : logroExistente.fecha_desbloqueo
    })
    .eq('alumno_id_alumno', alumnoId)
    .eq('logros_id_logros', logroId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Error al actualizar progreso: ${updateError.message}`);
  }

  return {
    nuevo: false,
    progreso: progresoActualizado.progreso,
    desbloqueado: esDesbloqueo,
    logro,
    fecha_desbloqueo: progresoActualizado.fecha_desbloqueo,
    recienDesbloqueado
  };
}


 // Obtiene todos los logros disponibles con el progreso del alumno
 
export async function obtenerLogrosConProgreso(alumnoId) {
  // logros disponibles
  const { data: todosLogros, error: logrosError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .order('id_logros', { ascending: true });

  if (logrosError) {
    throw new Error(`Error al obtener logros: ${logrosError.message}`);
  }

  // Obtener progreso del alumno
  const { data: logrosAlumno, error: alumnoError } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('*')
    .eq('alumno_id_alumno', alumnoId);

  if (alumnoError) {
    throw new Error(`Error al obtener progreso: ${alumnoError.message}`);
  }

  // Mapear logros con progreso
  const logrosMap = new Map(
    (logrosAlumno || []).map(l => [l.logros_id_logros, l])
  );

  return todosLogros.map(logro => {
    const progresoAlumno = logrosMap.get(logro.id_logros);
    return {
      ...logro,
      desbloqueado: !!progresoAlumno && progresoAlumno.progreso >= 100,
      progreso: progresoAlumno?.progreso || 0,
      fecha_desbloqueo: progresoAlumno?.fecha_desbloqueo || null
    };
  });
}


//  Obtiene solo los logros desbloqueados del alumno
 
export async function obtenerLogrosDesbloqueados(alumnoId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      fecha_desbloqueo,
      progreso,
      logro:logros_id_logros(*)
    `)
    .eq('alumno_id_alumno', alumnoId)
    .gte('progreso', 100)
    .order('fecha_desbloqueo', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener logros desbloqueados: ${error.message}`);
  }

  return (data || []).map(item => ({
    ...item.logro,
    fecha_desbloqueo: item.fecha_desbloqueo,
    progreso: item.progreso
  }));
}


//  Obtiene estadísticas de logros del alumno
 
export async function obtenerEstadisticasLogros(alumnoId) {
  // Total de logros disponibles
  const { count: totalLogros } = await supabaseAdmin
    .from('logros')
    .select('*', { count: 'exact', head: true });

  // Progreso del alumno
  const { data: logrosAlumno } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('progreso')
    .eq('alumno_id_alumno', alumnoId);

  const desbloqueados = (logrosAlumno || []).filter(l => l.progreso >= 100).length;
  const enProgreso = (logrosAlumno || []).filter(l => l.progreso > 0 && l.progreso < 100).length;
  const progresoTotal = logrosAlumno?.reduce((sum, l) => sum + l.progreso, 0) || 0;
  const progresoPromedio = logrosAlumno?.length > 0 ? progresoTotal / logrosAlumno.length : 0;

  return {
    total_logros: totalLogros || 0,
    desbloqueados,
    en_progreso: enProgreso,
    bloqueados: (totalLogros || 0) - desbloqueados - enProgreso,
    porcentaje_completado: totalLogros > 0 ? Math.round((desbloqueados / totalLogros) * 100) : 0,
    progreso_promedio: Math.round(progresoPromedio)
  };
}


 