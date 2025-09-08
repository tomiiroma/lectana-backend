import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export async function crearUsuario({ nombre, apellido, email, edad, password }) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const { data, error } = await supabaseAdmin
    .from('usuario')
    .insert([{ nombre, apellido, email, edad, password: hashedPassword }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { password: _omit, ...usuarioSinPassword } = data || {};
  return usuarioSinPassword;
}

export async function obtenerUsuarioPorId(id_usuario) {
  const { data, error } = await supabaseAdmin
    .from('usuario')
    .select('*')
    .eq('id_usuario', id_usuario)
    .single();

  if (error) throw new Error(error.message);
  const { password: _omit, ...usuarioSinPassword } = data || {};
  return usuarioSinPassword;
}

export async function actualizarUsuario(id_usuario, updates) {
  const payload = { ...updates };
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 12);
  }

  const { data, error } = await supabaseAdmin
    .from('usuario')
    .update(payload)
    .eq('id_usuario', id_usuario)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const { password: _omit, ...usuarioSinPassword } = data || {};
  return usuarioSinPassword;
}
