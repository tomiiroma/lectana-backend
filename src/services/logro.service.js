
import { supabaseAdmin } from '../config/supabase.js';

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
  const { error } = await supabaseAdmin
    .from('logros')
    .delete()
    .eq('id_logros', id);

  if (error) {
    throw new Error(`Error al eliminar logro: ${error.message}`);
  }

  return { message: 'Logro eliminado exitosamente' };
}


export async function verificarLogros(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_logros')
    .select(`
      *,
      logro:logro_id_logros(*)
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
      logro:logro_id_logros(*)
    `)
    .eq('alumno_id_alumno', usuarioId);

  if (error) {
    throw new Error(`Error al obtener logros del alumno: ${error.message}`);
  }

  return data || [];
}