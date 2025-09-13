import { supabaseAdmin } from '../config/supabase.js';
import { actualizarUsuario } from './usuario.service.js';

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

export async function obtenerPerfilAdministrador(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
      )
    `)
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Administrador no encontrado');
    }
    throw new Error('Error al obtener perfil: ' + error.message);
  }

  return data;
}

export async function actualizarPerfilAdministrador(usuarioId, updates) {
  // Separar campos de usuario y administrador
  const usuarioUpdates = {};
  const adminUpdates = {};

  if (updates.nombre) usuarioUpdates.nombre = updates.nombre;
  if (updates.apellido) usuarioUpdates.apellido = updates.apellido;
  if (updates.email) usuarioUpdates.email = updates.email;
  if (updates.edad) usuarioUpdates.edad = updates.edad;

  if (updates.dni) adminUpdates.dni = updates.dni;

  // Actualizar usuario si hay cambios
  if (Object.keys(usuarioUpdates).length > 0) {
    await actualizarUsuario(usuarioId, usuarioUpdates);
  }

  // Actualizar administrador si hay cambios
  if (Object.keys(adminUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from('administrador')
      .update(adminUpdates)
      .eq('usuario_id_usuario', usuarioId);

    if (error) {
      throw new Error('Error al actualizar datos de administrador: ' + error.message);
    }
  }

  // Retornar perfil actualizado
  return await obtenerPerfilAdministrador(usuarioId);
}
