import { supabaseAdmin } from '../config/supabase.js';
import { crearUsuario, actualizarUsuario } from './usuario.service.js';

export async function crearDocente({ usuario_id_usuario, dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo, verificado = true }) {
  // Crear docente asociado al usuario existente
  const docenteData = {
    dni,
    telefono: telefono || '',
    institucion_nombre: institucion_nombre || '',
    institucion_pais: institucion_pais || '',
    institucion_provincia: institucion_provincia || '',
    nivel_educativo: (nivel_educativo || 'PRIMARIA').toLowerCase(),
    verificado,
    usuario_id_usuario
  };

  const { data: docente, error } = await supabaseAdmin
    .from('docente')
    .insert(docenteData)
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad, activo
      )
    `)
    .single();

  if (error) {
    throw new Error('Error al crear docente: ' + error.message);
  }

  return {
    docente,
    message: 'Docente creado exitosamente'
  };
}

export async function listarDocentes({ page = 1, limit = 20, q = '', verificado, activo } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('docente')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad, activo
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

  if (typeof activo === 'boolean') {
    query = query.eq('usuario.activo', activo);
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

export async function obtenerPerfilDocente(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('docente')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad, activo
      )
    `)
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Docente no encontrado');
    }
    throw new Error('Error al obtener perfil: ' + error.message);
  }

  return data;
}

export async function actualizarPerfilDocente(usuarioId, updates) {
  // Separar campos de usuario y docente
  const usuarioUpdates = {};
  const docenteUpdates = {};

  if (updates.nombre) usuarioUpdates.nombre = updates.nombre;
  if (updates.apellido) usuarioUpdates.apellido = updates.apellido;
  if (updates.email) usuarioUpdates.email = updates.email;
  if (updates.edad) usuarioUpdates.edad = updates.edad;

  if (updates.dni) docenteUpdates.dni = updates.dni;
  if (updates.telefono !== undefined) docenteUpdates.telefono = updates.telefono;
  if (updates.institucion_nombre) docenteUpdates.institucion_nombre = updates.institucion_nombre;
  if (updates.institucion_pais) docenteUpdates.institucion_pais = updates.institucion_pais;
  if (updates.institucion_provincia) docenteUpdates.institucion_provincia = updates.institucion_provincia;
  if (updates.nivel_educativo) docenteUpdates.nivel_educativo = updates.nivel_educativo.toLowerCase();

  // Actualizar usuario si hay cambios
  if (Object.keys(usuarioUpdates).length > 0) {
    await actualizarUsuario(usuarioId, usuarioUpdates);
  }

  // Actualizar docente si hay cambios
  if (Object.keys(docenteUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from('docente')
      .update(docenteUpdates)
      .eq('usuario_id_usuario', usuarioId);

    if (error) {
      throw new Error('Error al actualizar datos de docente: ' + error.message);
    }
  }

  // Retornar perfil actualizado
  return await obtenerPerfilDocente(usuarioId);
}

export async function obtenerDocentePorId(docenteId) {
  const { data, error } = await supabaseAdmin
    .from('docente')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad, activo
      )
    `)
    .eq('id_docente', docenteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Docente no encontrado');
    }
    throw new Error('Error al obtener docente: ' + error.message);
  }

  return data;
}

export async function adminActualizarDocente(docenteId, updates) {
  // Obtener el docente para acceder al usuario_id_usuario
  const { data: docente, error: docenteError } = await supabaseAdmin
    .from('docente')
    .select('usuario_id_usuario')
    .eq('id_docente', docenteId)
    .single();

  if (docenteError || !docente) {
    throw new Error('Docente no encontrado');
  }

  // Separar campos de usuario y docente
  const usuarioUpdates = {};
  const docenteUpdates = {};

  if (updates.nombre) usuarioUpdates.nombre = updates.nombre;
  if (updates.apellido) usuarioUpdates.apellido = updates.apellido;
  if (updates.email) usuarioUpdates.email = updates.email;
  if (updates.edad) usuarioUpdates.edad = updates.edad;
  if (updates.activo !== undefined) usuarioUpdates.activo = updates.activo;

  if (updates.telefono !== undefined) docenteUpdates.telefono = updates.telefono;
  if (updates.institucion_nombre) docenteUpdates.institucion_nombre = updates.institucion_nombre;
  if (updates.institucion_pais) docenteUpdates.institucion_pais = updates.institucion_pais;
  if (updates.institucion_provincia) docenteUpdates.institucion_provincia = updates.institucion_provincia;
  if (updates.nivel_educativo) docenteUpdates.nivel_educativo = updates.nivel_educativo.toLowerCase();
  if (updates.verificado !== undefined) docenteUpdates.verificado = updates.verificado;

  // Actualizar usuario si hay cambios
  if (Object.keys(usuarioUpdates).length > 0) {
    await actualizarUsuario(docente.usuario_id_usuario, usuarioUpdates);
  }

  // Actualizar docente si hay cambios
  if (Object.keys(docenteUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from('docente')
      .update(docenteUpdates)
      .eq('id_docente', docenteId);

    if (error) {
      throw new Error('Error al actualizar datos de docente: ' + error.message);
    }
  }

  // Retornar docente actualizado
  return await obtenerDocentePorId(docenteId);
}
