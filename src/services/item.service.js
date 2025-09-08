import { supabaseAdmin } from '../config/supabase.js';

export async function crearItem(data) {
  const { data: item, error } = await supabaseAdmin
    .from('item')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear item: ${error.message}`);
  }

  return item;
}

export async function obtenerItemPorId(id) {
  const { data: item, error } = await supabaseAdmin
    .from('item')
    .select('*')
    .eq('id_item', id)
    .single();

  if (error) {
    throw new Error('Item no encontrado');
  }

  return item;
}

export async function listarItems() {
  const { data: items, error } = await supabaseAdmin
    .from('item')
    .select('*')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('precio_puntos', { ascending: true });

  if (error) {
    throw new Error(`Error al listar items: ${error.message}`);
  }

  return items;
}

export async function actualizarItem(id, data) {
  const { data: item, error } = await supabaseAdmin
    .from('item')
    .update(data)
    .eq('id_item', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar item: ${error.message}`);
  }

  return item;
}

export async function eliminarItem(id) {
  const { error } = await supabaseAdmin
    .from('item')
    .delete()
    .eq('id_item', id);

  if (error) {
    throw new Error(`Error al eliminar item: ${error.message}`);
  }

  return { message: 'Item eliminado exitosamente' };
}

export async function comprarItem(usuarioId, itemId) {
  // Obtener item
  const { data: item, error: itemError } = await supabaseAdmin
    .from('item')
    .select('*')
    .eq('id_item', itemId)
    .eq('activo', true)
    .single();

  if (itemError || !item) {
    throw new Error('Item no disponible');
  }

  // Obtener puntos del alumno
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from('alumno')
    .select('puntos_totales')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (alumnoError || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  if (alumno.puntos_totales < item.precio_puntos) {
    throw new Error('Puntos insuficientes');
  }

  // Verificar si ya tiene el item
  const { data: itemExistente } = await supabaseAdmin
    .from('item_comprado')
    .select('id_item_comprado')
    .eq('alumno_usuario_id_usuario', usuarioId)
    .eq('item_id_item', itemId)
    .single();

  if (itemExistente) {
    throw new Error('Ya tienes este item');
  }

  // Comprar item
  const { data: compra, error: compraError } = await supabaseAdmin
    .from('item_comprado')
    .insert({
      alumno_usuario_id_usuario: usuarioId,
      item_id_item: itemId,
      fecha_compra: new Date().toISOString()
    })
    .select('*')
    .single();

  if (compraError) {
    throw new Error('Error al comprar item');
  }

  // Descontar puntos
  const nuevosPuntos = alumno.puntos_totales - item.precio_puntos;
  await supabaseAdmin
    .from('alumno')
    .update({ puntos_totales: nuevosPuntos })
    .eq('usuario_id_usuario', usuarioId);

  return {
    compra,
    puntos_restantes: nuevosPuntos,
    message: 'Item comprado exitosamente'
  };
}

export async function obtenerItemsComprados(usuarioId) {
  const { data: items, error } = await supabaseAdmin
    .from('item_comprado')
    .select(`
      *,
      item:item_id_item(*)
    `)
    .eq('alumno_usuario_id_usuario', usuarioId)
    .order('fecha_compra', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener items comprados: ${error.message}`);
  }

  return items;
}
