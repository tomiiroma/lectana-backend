import { supabaseAdmin } from '../config/supabase.js';

/**
 * Obtener todos los items disponibles (imágenes desbloqueables)
 */
export async function obtenerItems() {
  const { data, error } = await supabaseAdmin
    .from('item')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener items por categoría
 */
export async function obtenerItemsPorCategoria(categoria) {
  const { data, error } = await supabaseAdmin
    .from('item')
    .select('*')
    .eq('categoria', categoria)
    .eq('activo', true)
    .order('precio_puntos', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}


/**
 * Obtener un item específico por ID
 */
export async function obtenerItemPorId(id) {
  const { data, error } = await supabaseAdmin
    .from('item')
    .select('*')
    .eq('id_item', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crear un nuevo item (imagen desbloqueable)
 */
export async function crearItem({ nombre, descripcion, precio_puntos, tipo, categoria, url_imagen, activo = true }) {
  const { data, error } = await supabaseAdmin
    .from('item')
    .insert([{
      nombre,
      descripcion,
      precio_puntos,
      tipo,
      categoria,
      url_imagen,
      activo
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Actualizar un item existente
 */
export async function actualizarItem(id, { nombre, descripcion, precio_puntos, tipo, categoria, url_imagen, activo }) {
  const { data, error } = await supabaseAdmin
    .from('item')
    .update({
      nombre,
      descripcion,
      precio_puntos,
      tipo,
      categoria,
      url_imagen,
      activo
    })
    .eq('id_item', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Eliminar un item (soft delete)
 */
export async function eliminarItem(id) {
  const { data, error } = await supabaseAdmin
    .from('item')
    .update({ activo: false })
    .eq('id_item', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtener items desbloqueados por un estudiante
 */
export async function obtenerItemsDesbloqueados(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('item_desbloqueado')
    .select(`
      *,
      item:item_id_item (
        id_item,
        nombre,
        descripcion,
        tipo,
        categoria,
        url_imagen,
        precio_puntos
      )
    `)
    .eq('usuario_id_usuario', usuarioId);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Desbloquear un item para un estudiante
 */
export async function desbloquearItem(usuarioId, itemId) {
  // Verificar si el item ya está desbloqueado
  const { data: yaDesbloqueado } = await supabaseAdmin
    .from('item_desbloqueado')
    .select('id_item_desbloqueado')
    .eq('usuario_id_usuario', usuarioId)
    .eq('item_id_item', itemId)
    .single();

  if (yaDesbloqueado) {
    throw new Error('Este item ya está desbloqueado');
  }

  // Desbloquear el item
  const { data, error } = await supabaseAdmin
    .from('item_desbloqueado')
    .insert([{
      usuario_id_usuario: usuarioId,
      item_id_item: itemId,
      fecha_desbloqueo: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Verificar si un item está desbloqueado para un estudiante
 */
export async function verificarItemDesbloqueado(usuarioId, itemId) {
  const { data, error } = await supabaseAdmin
    .from('item_desbloqueado')
    .select('id_item_desbloqueado')
    .eq('usuario_id_usuario', usuarioId)
    .eq('item_id_item', itemId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return !!data;
}

/**
 * Obtener estadísticas de items
 */
export async function obtenerEstadisticasItems() {
  const { data: totalItems, error: totalError } = await supabaseAdmin
    .from('item')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);

  if (totalError) throw new Error(totalError.message);

  const { data: itemsPorTipo, error: tipoError } = await supabaseAdmin
    .from('item')
    .select('tipo')
    .eq('activo', true);

  if (tipoError) throw new Error(tipoError.message);

  const { data: itemsPorCategoria, error: categoriaError } = await supabaseAdmin
    .from('item')
    .select('categoria')
    .eq('activo', true);

  if (categoriaError) throw new Error(categoriaError.message);

  return {
    total_items: totalItems,
    items_por_tipo: itemsPorTipo.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + 1;
      return acc;
    }, {}),
    items_por_categoria: itemsPorCategoria.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {})
  };
}
