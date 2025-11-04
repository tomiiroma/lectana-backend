
import { supabaseAdmin } from '../config/supabase.js';
import { eliminarImagenLogro } from './logro.imagen.service.js';

// Admin

export async function crearLogro(data) {
  const { nombre, descripcion, url_imagen, evento, valor } = data;
  
  const { data: logro, error } = await supabaseAdmin
    .from('logros')
    .insert({
      nombre,
      descripcion: descripcion || '',
      url_imagen: url_imagen || null,
      evento, 
      valor
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
export async function desbloquearLogro(alumnoId, logroId) {
  console.log(' alumnoId recibido:', alumnoId);

  // Verificar que el alumno exista
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from('alumno')
    .select('*')
    .eq('id_alumno', alumnoId)
    .single();

  if (alumnoError || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  // Verificar que el logro exista
  const { data: logro, error: logroError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', logroId)
    .single();

  if (logroError || !logro) {
    throw new Error('Logro no encontrado');
  }

  // Verificar si el logro ya fue desbloqueado
  const { data: logroExistente } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('*')
    .eq('alumno_id_alumno', alumnoId)
    .eq('logros_id_logros', logroId)
    .single();

  if (logroExistente) {
    return {
      yaDesbloqueado: true,
      logro,
      fecha_desbloqueo: logroExistente.fecha_desbloqueo,
    };
  }

  // Insertar nuevo logro desbloqueado
  const { data: nuevoLogro, error: insertError } = await supabaseAdmin
    .from('alumno_has_logros')
    .insert({
      alumno_id_alumno: alumnoId,
      logros_id_logros: logroId,
      fecha_desbloqueo: new Date().toISOString(),
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
  };
}




//  Obtiene solo los logros desbloqueados del alumno
 
export async function obtenerLogrosDesbloqueados(alumnoId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      fecha_desbloqueo,
      logro:logros_id_logros(*)
    `)
    .eq('alumno_id_alumno', alumnoId)
    .order('fecha_desbloqueo', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener logros desbloqueados: ${error.message}`);
  }

  return (data || []).map(item => ({
    ...item.logro,
    fecha_desbloqueo: item.fecha_desbloqueo
  }));
}


//  Obtiene estadísticas de logros del alumno
 
export async function obtenerEstadisticasLogros(alumnoId) {
  // Total de logros disponibles
  const { count: totalLogros } = await supabaseAdmin
    .from('logros')
    .select('*', { count: 'exact', head: true });

  // Logros desbloqueados 
  const { data: logrosAlumno } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('*')
    .eq('alumno_id_alumno', alumnoId);

  const desbloqueados = logrosAlumno?.length || 0;

  return {
    total_logros: totalLogros || 0,
    desbloqueados,
    bloqueados: (totalLogros || 0) - desbloqueados,
    porcentaje_completado: totalLogros > 0 
      ? Math.round((desbloqueados / totalLogros) * 100) 
      : 0
  };
}

 