import { supabaseAdmin } from '../config/supabase.js';

export async function crearCuento(data) {
  const { data: cuento, error } = await supabaseAdmin
    .from('cuento')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear cuento: ${error.message}`);
  }

  return cuento;
}

export async function obtenerCuentoPorId(id) {
  const { data: cuento, error } = await supabaseAdmin
    .from('cuento')
    .select(`
      *,
      genero:genero_id_genero(*),
      autor:autor_id_autor(*)
    `)
    .eq('id_cuento', id)
    .single();

  if (error) {
    throw new Error('Cuento no encontrado');
  }

  return cuento;
}

export async function listarCuentos(filtros = {}) {
  let query = supabaseAdmin
    .from('cuento')
    .select(`
      id_cuento,
      titulo,
      edad_publico,
      pdf_url,
      autor:autor_id_autor(nombre, apellido),
      genero:genero_id_genero(nombre)
    `);

  // Aplicar filtros
  if (filtros.edad_publico) {
    query = query.eq('edad_publico', filtros.edad_publico);
  }
  
  if (filtros.genero_id) {
    query = query.eq('genero_id_genero', filtros.genero_id);
  }
  
  if (filtros.autor_id) {
    query = query.eq('autor_id_autor', filtros.autor_id);
  }
  
  if (filtros.titulo) {
    query = query.ilike('titulo', `%${filtros.titulo}%`);
  }

  // Ordenar por título ascendente por defecto
  query = query.order('titulo', { ascending: true });

  const { data: cuentos, error } = await query;

  if (error) {
    throw new Error(`Error al listar cuentos: ${error.message}`);
  }

  return cuentos;
}

export async function actualizarCuento(id, data) {
  const { data: cuento, error } = await supabaseAdmin
    .from('cuento')
    .update(data)
    .eq('id_cuento', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar cuento: ${error.message}`);
  }

  return cuento;
}

export async function eliminarCuento(id) {
  const { error } = await supabaseAdmin
    .from('cuento')
    .delete()
    .eq('id_cuento', id);

  if (error) {
    throw new Error(`Error al eliminar cuento: ${error.message}`);
  }

  return { message: 'Cuento eliminado exitosamente' };
}

export async function contarCuentos() {
  const { count, error } = await supabaseAdmin
    .from('cuento')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Error al contar cuentos: ${error.message}`);
  }

  return count ?? 0;
}

export async function obtenerCuentosPorAula(aulaId) {
  const { data: cuentos, error } = await supabaseAdmin
    .from('cuento_asignado')
    .select(`
      *,
      cuento:cuento_id_cuento(
        *,
        genero:genero_id_genero(*),
        autor:autor_id_autor(*)
      )
    `)
    .eq('aula_id_aula', aulaId);

  if (error) {
    throw new Error(`Error al obtener cuentos del aula: ${error.message}`);
  }

  return cuentos.map(item => item.cuento);
}

// Funciones para rutas públicas
export async function listarCuentosPublicos(filtros = {}) {
  const { page = 1, limit = 10, edad_publico, genero_id, autor_id, titulo } = filtros;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('cuento')
    .select(`
      id_cuento,
      titulo,
      edad_publico,
      url_img,
      duracion,
      audio_url,
      audio_duration,
      audio_status,
      autor:autor_id_autor(nombre, apellido),
      genero:genero_id_genero(nombre)
    `, { count: 'exact' });

  // Aplicar filtros
  if (edad_publico) {
    query = query.eq('edad_publico', edad_publico);
  }
  
  if (genero_id) {
    query = query.eq('genero_id_genero', genero_id);
  }
  
  if (autor_id) {
    query = query.eq('autor_id_autor', autor_id);
  }
  
  if (titulo) {
    query = query.ilike('titulo', `%${titulo}%`);
  }

  // Ordenar por título ascendente por defecto
  query = query.order('titulo', { ascending: true });

  // Aplicar paginación
  query = query.range(offset, offset + limit - 1);

  const { data: cuentos, error, count } = await query;

  if (error) {
    throw new Error(`Error al listar cuentos públicos: ${error.message}`);
  }

  return {
    cuentos,
    paginacion: {
      pagina_actual: page,
      total_paginas: Math.ceil((count || 0) / limit),
      total_cuentos: count || 0,
      cuentos_por_pagina: limit
    }
  };
}

export async function obtenerCuentoPublicoPorId(id) {
  const { data: cuento, error } = await supabaseAdmin
    .from('cuento')
    .select(`
      id_cuento,
      titulo,
      edad_publico,
      url_img,
      duracion,
      pdf_url,
      audio_url,
      audio_duration,
      audio_status,
      autor:autor_id_autor(nombre, apellido),
      genero:genero_id_genero(nombre)
    `)
    .eq('id_cuento', id)
    .single();

  if (error) {
    throw new Error('Cuento no encontrado');
  }

  return cuento;
}