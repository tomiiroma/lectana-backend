import { supabaseAdmin } from '../config/supabase.js';

export async function listarAdministradores({ page = 1, limit = 20, q = '' } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('administrador')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email
      )
    `, { count: 'exact' })
    .range(from, to)
    .order('id_administrador', { ascending: true });

  if (q && q.trim()) {
    query = query.or(
      `usuario.nombre.ilike.%${q}%,usuario.apellido.ilike.%${q}%,usuario.email.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    items: data || [],
    page: Number(page),
    limit: Number(limit),
    total: count || 0,
    total_pages: count ? Math.ceil(count / Number(limit)) : 0
  };
}

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
