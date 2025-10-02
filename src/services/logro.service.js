import { supabaseAdmin } from '../config/supabase.js';

export async function crearLogro(data) {
  const { data: logro, error } = await supabaseAdmin
    .from('logro')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear logro: ${error.message}`);
  }

  return logro;
}

export async function obtenerLogroPorId(id) {
  const { data: logro, error } = await supabaseAdmin
    .from('logro')
    .select('*')
    .eq('id_logro', id)
    .single();

  if (error) {
    throw new Error('Logro no encontrado');
  }

  return logro;
}

export async function listarLogros() {
  const { data: logros, error } = await supabaseAdmin
    .from('logro')
    .select('*')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('puntos_requeridos', { ascending: true });

  if (error) {
    throw new Error(`Error al listar logros: ${error.message}`);
  }

  return logros;
}

export async function actualizarLogro(id, data) {
  const { data: logro, error } = await supabaseAdmin
    .from('logro')
    .update(data)
    .eq('id_logro', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar logro: ${error.message}`);
  }

  return logro;
}

export async function eliminarLogro(id) {
  const { error } = await supabaseAdmin
    .from('logro')
    .delete()
    .eq('id_logro', id);

  if (error) {
    throw new Error(`Error al eliminar logro: ${error.message}`);
  }

  return { message: 'Logro eliminado exitosamente' };
}

export async function verificarLogros(usuarioId) {
  // Obtener progreso del alumno
  const { data: alumno } = await supabaseAdmin
    .from('alumno')
    .select('puntos_totales')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (!alumno) {
    throw new Error('Alumno no encontrado');
  }

  // Obtener logros disponibles
  const { data: logros } = await supabaseAdmin
    .from('logro')
    .select('*')
    .eq('activo', true);

  // Obtener logros ya obtenidos
  const { data: logrosObtenidos } = await supabaseAdmin
    .from('logro_obtenido')
    .select('logro_id_logro')
    .eq('alumno_usuario_id_usuario', usuarioId);

  const logrosObtenidosIds = logrosObtenidos?.map(l => l.logro_id_logro) || [];

  // Verificar logros de puntos
  const logrosPuntos = logros?.filter(l => l.categoria === 'puntos') || [];
  const nuevosLogros = [];

  for (const logro of logrosPuntos) {
    if (!logrosObtenidosIds.includes(logro.id_logro) && 
        alumno.puntos_totales >= logro.puntos_requeridos) {
      
      // Otorgar logro
      await supabaseAdmin
        .from('logro_obtenido')
        .insert({
          alumno_usuario_id_usuario: usuarioId,
          logro_id_logro: logro.id_logro,
          fecha_obtenido: new Date().toISOString()
        });

      nuevosLogros.push(logro);
    }
  }

  return {
    nuevos_logros: nuevosLogros,
    total_logros: logrosObtenidosIds.length + nuevosLogros.length
  };
}

export async function obtenerLogrosAlumno(usuarioId) {
  const { data: logros, error } = await supabaseAdmin
    .from('logro_obtenido')
    .select(`
      *,
      logro:logro_id_logro(*)
    `)
    .eq('alumno_usuario_id_usuario', usuarioId)
    .order('fecha_obtenido', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener logros del alumno: ${error.message}`);
  }

  return logros;
}
