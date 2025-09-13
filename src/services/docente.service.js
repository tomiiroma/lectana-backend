import { supabaseAdmin } from '../config/supabase.js';
import { crearUsuario } from './usuario.service.js';

export async function crearDocente({ nombre, apellido, email, edad, password, dni, telefono, institucion_nombre, institucion_pais, institucion_provincia, nivel_educativo }) {
  // Crear usuario primero
  const usuario = await crearUsuario({ nombre, apellido, email, edad, password });
  
  // Crear docente asociado al usuario
  const docenteData = {
    dni,
    telefono: telefono || '',
    institucion_nombre: institucion_nombre || '',
    institucion_pais: institucion_pais || '',
    institucion_provincia: institucion_provincia || '',
    nivel_educativo: nivel_educativo || 'PRIMARIA',
    verificado: true,
    usuario_id_usuario: usuario.id_usuario
  };

  const { data: docente, error } = await supabaseAdmin
    .from('docente')
    .insert(docenteData)
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
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

export async function listarDocentes({ page = 1, limit = 20, q = '', verificado } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('docente')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
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
