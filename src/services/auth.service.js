import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { crearUsuario } from './usuario.service.js';
import { crearDocente } from './docente.service.js';
import { crearAdministrador } from './administrador.service.js';
import { verificarCapacidadAula } from '../utils/validaciones.js';


// TODO: PONER EN COOKIE EL JWT

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
    .select('id_docente, dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo, verificado')
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


export async function registerAlumno({ nombre, apellido, email, edad, password, codigo_acceso }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET no configurado');

  // Crear usuario
  const usuario = await crearUsuario({ nombre, apellido, email, edad, password });
  
  // Si hay código de acceso, vincular al aula
  if (codigo_acceso) {
    const { data: aula } = await supabaseAdmin
      .from('aula')
      .select('id_aula')
      .eq('codigo_acceso', codigo_acceso)
      .single();
    
    if (aula) {
      // Verificar límite de estudiantes por aula (máximo 50)
      const hayEspacio = await verificarCapacidadAula(aula.id_aula);
      
      if (!hayEspacio) {
        throw new Error('El aula ha alcanzado el límite máximo de 50 estudiantes');
      }

      await supabaseAdmin
        .from('alumno')
        .insert({
          usuario_id_usuario: usuario.id_usuario,
          aula_id_aula: aula.id_aula
        });
    }
  } else {
    // Crear alumno sin aula
    await supabaseAdmin
      .from('alumno')
      .insert({
        usuario_id_usuario: usuario.id_usuario
      });
  }

  // Generar token
  const payload = {
    sub: usuario.id_usuario,
    role: 'alumno',
    verificado: true,
  };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  return {
    token,
    role: 'alumno',
    user: usuario,
    message: 'Alumno registrado exitosamente'
  };
}

export async function registerDocente({ nombre, apellido, email, edad, password, dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET no configurado');

  // Crear usuario
  const usuario = await crearUsuario({ nombre, apellido, email, edad, password });
  
  // Crear docente
  const docente = await crearDocente({
    usuario_id_usuario: usuario.id_usuario,
    dni,
    telefono,
    institucion_nombre,
    institucion_pais,
    institucion_provincia,
    nivel_educativo,
    verificado: false // Requiere verificación manual
  });

  // Generar token
  const payload = {
    sub: usuario.id_usuario,
    role: 'docente',
    docente_id: docente.id_docente,
    verificado: false,
  };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  return {
    token,
    role: 'docente',
    user: usuario,
    docente,
    message: 'Docente registrado exitosamente. Su cuenta será verificada por un administrador.'
  };
}

export async function registerAdministrador({ nombre, apellido, email, edad, password, dni, telefono }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET no configurado');

  // Crear usuario
  const usuario = await crearUsuario({ nombre, apellido, email, edad, password });
  
  // Crear administrador
  const administrador = await crearAdministrador({
    usuario_id_usuario: usuario.id_usuario,
    dni,
    telefono
  });

  // Generar token
  const payload = {
    sub: usuario.id_usuario,
    role: 'administrador',
    administrador_id: administrador.id_administrador,
    verificado: true,
  };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  return {
    token,
    role: 'administrador',
    user: usuario,
    administrador,
    message: 'Administrador registrado exitosamente'
  };
}

export async function getMe(user) {
  const { data: usuario, error } = await supabaseAdmin
    .from('usuario')
    .select('*')
    .eq('id_usuario', user.sub)
    .single();

  if (error) throw new Error('Usuario no encontrado');

  const { password, ...usuarioPublico } = usuario;

  let roleData = {};
  
  if (user.role === 'docente') {
    const { data: docente } = await supabaseAdmin
      .from('docente')
      .select('*')
      .eq('usuario_id_usuario', user.sub)
      .single();
    roleData = { docente };
  } else if (user.role === 'administrador') {
    const { data: administrador } = await supabaseAdmin
      .from('administrador')
      .select('*')
      .eq('usuario_id_usuario', user.sub)
      .single();
    roleData = { administrador };
  } else if (user.role === 'alumno') {
    const { data: alumno } = await supabaseAdmin
      .from('alumno')
      .select('*')
      .eq('usuario_id_usuario', user.sub)
      .single();
    roleData = { alumno };
  }

  return {
    user: usuarioPublico,
    role: user.role,
    verificado: user.verificado,
    ...roleData
  };
}
