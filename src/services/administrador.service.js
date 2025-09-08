import { supabaseAdmin } from '../config/supabase.js';

export async function crearAdministrador({ dni, usuario_id_usuario }) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .insert([{ dni, usuario_id_usuario }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerAdministradorPorId(id_administrador) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .select('*')
    .eq('id_administrador', id_administrador)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarAdministrador(id_administrador, updates) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .update(updates)
    .eq('id_administrador', id_administrador)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
