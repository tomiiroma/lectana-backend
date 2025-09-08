import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login({ email, password }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET no configurado');

  // Buscar usuario por email
  const { data: usuario, error: errUsr } = await supabaseAdmin
    .from('usuario')
    .select('*')
    .eq('email', email)
    .single();

  if (errUsr) throw new Error(errUsr.message);
  if (!usuario) throw new Error('Credenciales inválidas');

  const ok = await bcrypt.compare(password, usuario.password);
  if (!ok) throw new Error('Credenciales inválidas');

  // Detectar rol
  const { data: docenteRow } = await supabaseAdmin
    .from('docente')
    .select('id_docente, verificado')
    .eq('usuario_id_usuario', usuario.id_usuario)
    .maybeSingle();

  let role = 'alumno';
  let docente = undefined;
  let administrador = undefined;
  let administradorRow = undefined;

  if (docenteRow) {
    role = 'docente';
    docente = docenteRow;
  } else {
    const { data: adminRow } = await supabaseAdmin
      .from('administrador')
      .select('id_administrador')
      .eq('usuario_id_usuario', usuario.id_usuario)
      .maybeSingle();
    if (adminRow) {
      role = 'administrador';
      administradorRow = adminRow;
    }
  }

  const payload = {
    sub: usuario.id_usuario,
    role,
    docente_id: docente ? docente.id_docente : undefined,
    administrador_id: administradorRow ? administradorRow.id_administrador : undefined,
    verificado: docente ? (docente.verificado ?? false) : true,
  };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  const { password: _omit, ...usuarioPublico } = usuario;

  return {
    token,
    role,
    user: usuarioPublico,
    docente: docente || undefined,
    administrador: administrador || undefined,
  };
}
