import { supabaseAdmin } from '../config/supabase.js';


export async function listarDocentes({ page = 1, limit = 20, q = '', verificado } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('docente')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email
      )
    `, { count: 'exact' })
    .range(from, to)
    .order('id_docente', { ascending: true });

  if (q && q.trim()) {
    query = query.or(
      `usuario.nombre.ilike.%${q}%,usuario.apellido.ilike.%${q}%,usuario.email.ilike.%${q}%`
    );
  }

  if (typeof verificado === 'boolean') {
    query = query.eq('verificado', verificado);
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
