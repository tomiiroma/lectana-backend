import { supabaseAdmin } from '../config/supabase.js';

export async function crearActividad({ fecha_entrega, fecha_publicacion, tipo, descripcion, cuento_id_cuento, docente_id_docente }) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .insert([{ fecha_entrega, fecha_publicacion, tipo, descripcion, cuento_id_cuento, docente_id_docente }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerActividadPorId(id_actividad) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .select('*')
    .eq('id_actividad', id_actividad)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarActividad(id_actividad, updates) {
  const { data, error } = await supabaseAdmin
    .from('actividad')
    .update(updates)
    .eq('id_actividad', id_actividad)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminarActividad(id_actividad) {
  const { error } = await supabaseAdmin
    .from('actividad')
    .delete()
    .eq('id_actividad', id_actividad);
  if (error) throw new Error(error.message);
}
