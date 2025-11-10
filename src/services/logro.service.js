
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
    .order('fecha_desbloqueo', { ascending: true });

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






 // Obtiene el id_alumno del usuario_id_usuario
 
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


// Desbloquea un logro para un alumno
export async function desbloquearLogro(usuarioId, logroId) {
  
  const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);

  console.log('🔎 alumnoId obtenido:', alumnoId);


  const { data: logro, error: logroError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .eq('id_logros', logroId)
    .single();

  if (logroError || !logro) {
    throw new Error('Logro no encontrado');
  }

  
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




// logros desbloqueados del alumno
 
export async function obtenerLogrosDesbloqueados(usuarioId) {
  
  const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);

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


// logros que el alumno NO ha desbloqueado
 
export async function obtenerLogrosBloqueados(usuarioId) {
  
  const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);

 
  const { data: todosLosLogros, error: logrosError } = await supabaseAdmin
    .from('logros')
    .select('*')
    .order('evento', { ascending: true })
    .order('valor', { ascending: true });

  if (logrosError) {
    throw new Error(`Error al obtener logros: ${logrosError.message}`);
  }

  
  const { data: logrosDesbloqueados, error: desbloqueadosError } = await supabaseAdmin
    .from('alumno_has_logros')
    .select('logros_id_logros')
    .eq('alumno_id_alumno', alumnoId);

  if (desbloqueadosError) {
    throw new Error(`Error al verificar logros desbloqueados: ${desbloqueadosError.message}`);
  }

  
  const idsDesbloqueados = new Set(
    (logrosDesbloqueados || []).map(l => l.logros_id_logros)
  );

  
  const logrosBloqueados = todosLosLogros.filter(
    logro => !idsDesbloqueados.has(logro.id_logros)
  );

  return logrosBloqueados;
}



// estadísticas de logros del alumno
 
export async function obtenerEstadisticasLogros(usuarioId) {
 
  const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);

  
  const { count: totalLogros } = await supabaseAdmin
    .from('logros')
    .select('*', { count: 'exact', head: true });


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
 