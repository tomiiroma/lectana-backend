import { supabaseAdmin } from '../config/supabase.js';

function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function crearAula({ nombre_aula, grado, docente_id_docente }) {
  // Generar código único
  let codigo = generateRandomCode(6);
  for (let i = 0; i < 5; i++) {
    const { data: exists } = await supabaseAdmin.from('aula').select('id_aula').eq('codigo_acceso', codigo).maybeSingle();
    if (!exists) break;
    codigo = generateRandomCode(6);
  }

  const { data, error } = await supabaseAdmin
    .from('aula')
    .insert([{ nombre_aula, grado, codigo_acceso: codigo, docente_id_docente }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerAulaPorId(id_aula) {
  const { data, error } = await supabaseAdmin
    .from('aula')
    .select('*')
    .eq('id_aula', id_aula)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarAula(id_aula, updates) {
  const { data, error } = await supabaseAdmin
    .from('aula')
    .update(updates)
    .eq('id_aula', id_aula)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function eliminarAula(id_aula) {
  const { error } = await supabaseAdmin
    .from('aula')
    .delete()
    .eq('id_aula', id_aula);
  if (error) throw new Error(error.message);
}

export async function listarAlumnosDeAula(id_aula) {
  // Join alumno_has_aula -> alumno -> usuario
  const { data, error } = await supabaseAdmin
    .from('alumno_has_aula')
    .select(`
      alumno:alumno_id_alumno (
        id_alumno,
        usuario:usuario_id_usuario (
          id_usuario, nombre, apellido, email, edad
        )
      )
    `)
    .eq('aula_id_aula', id_aula);
  if (error) throw new Error(error.message);
  const alumnos = (data || []).map(r => ({
    id_alumno: r.alumno?.id_alumno,
    ...r.alumno?.usuario,
  })).filter(Boolean);
  return alumnos;
}
