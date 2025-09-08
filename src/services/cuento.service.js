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
      *,
      genero:genero_id_genero(*),
      autor:autor_id_autor(*)
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
  
  if (filtros.activo !== undefined) {
    query = query.eq('activo', filtros.activo);
  }

  // Ordenar por fecha de creación
  query = query.order('fecha_creacion', { ascending: false });

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
