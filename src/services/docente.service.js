import { supabaseAdmin } from '../config/supabase.js';

export async function crearDocente({ dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo, usuario_id_usuario }) {
  const { data, error } = await supabaseAdmin
    .from('docente')
    .insert([{ dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo, usuario_id_usuario }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerDocentePorId(id_docente) {
  const { data, error } = await supabaseAdmin
    .from('docente')
    .select('*')
    .eq('id_docente', id_docente)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarDocente(id_docente, updates) {
  const { data, error } = await supabaseAdmin
    .from('docente')
    .update(updates)
    .eq('id_docente', id_docente)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
