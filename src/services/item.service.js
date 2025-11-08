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
    .eq('disponible', true)
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


 // Crear un nuevo item (imagen desbloqueable)
 
export async function crearItem({ nombre, descripcion, precio, url_imagen, disponible = true }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('item')
      .insert([{
        nombre,
        descripcion,
        disponible,
        precio,
        url_imagen
      }])
      .select()
      .single();

    if (error) {
      return {
        ok: false,
        error: error.message || 'Error al crear el item'
      };
    }

    return {
      ok: true,
      data: data
    };
  } catch (error) {
    console.error('Error al crear item:', error);
    return {
      ok: false,
      error: 'Error inesperado al crear el item'
    };
  }
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


 // Eliminar un item 
 
export async function eliminarItem(id) {
  try {
    
    const validacion = idSchema.safeParse({ id });
    if (!validacion.success) {
      return {
        ok: false,
        error: 'ID inválido'
      };
    }

    
    const { data: itemExistente, error: errorBusqueda } = await supabaseAdmin
      .from('item')
      .select('id_item, nombre, disponible')
      .eq('id_item', id)
      .single();

    if (errorBusqueda) {
      return { 
        ok: false, 
        error: 'Item no encontrado' 
      };
    }

   
    if (!itemExistente.disponible) {
      return { 
        ok: false, 
        error: 'El item ya está deshabilitado' 
      };
    }

    
    const { count: totalCompras, error: errorCompras } = await supabaseAdmin
      .from('alumno_item')
      .select('*', { count: 'exact', head: true })
      .eq('id_item', id);

    if (errorCompras) {
      console.error('Error al verificar compras:', errorCompras);
    }

  
    const { data: itemActualizado, error: errorActualizacion } = await supabaseAdmin
      .from('item')
      .update({ disponible: false })
      .eq('id_item', id)
      .select()
      .single();

    if (errorActualizacion) {
      return { 
        ok: false, 
        error: 'Error al deshabilitar el item' 
      };
    }

    return { 
      ok: true, 
      data: {
        item: itemActualizado,
        compras: totalCompras || 0,
        message: totalCompras > 0 
          ? `Item deshabilitado. ${totalCompras} alumnos ya lo compraron pero seguirán teniéndolo.`
          : 'Item deshabilitado exitosamente.'
      }
    };

  } catch (error) {
    console.error('Error al deshabilitar item:', error);
    return { 
      ok: false, 
      error: 'Error inesperado al deshabilitar el item' 
    };
  }
}



//  Reactivar un item 
 
export async function reactivarItem(id) {
  try {
    
    const validacion = idSchema.safeParse({ id });
    if (!validacion.success) {
      return {
        ok: false,
        error: 'ID inválido'
      };
    }

   
    const { data: itemExistente, error: errorBusqueda } = await supabaseAdmin
      .from('item')
      .select('id_item, nombre, disponible')
      .eq('id_item', id)
      .single();

    if (errorBusqueda) {
      return { 
        ok: false, 
        error: 'Item no encontrado' 
      };
    }

  
    if (itemExistente.disponible) {
      return { 
        ok: false, 
        error: 'El item ya está disponible' 
      };
    }


    const { data: itemActualizado, error: errorActualizacion } = await supabaseAdmin
      .from('item')
      .update({ disponible: true })
      .eq('id_item', id)
      .select()
      .single();

    if (errorActualizacion) {
      return { 
        ok: false, 
        error: 'Error al reactivar el item' 
      };
    }

    return { 
      ok: true, 
      data: {
        item: itemActualizado,
        message: 'Item reactivado exitosamente. Ya está disponible en la tienda.'
      }
    };

  } catch (error) {
    console.error('Error al reactivar item:', error);
    return { 
      ok: false, 
      error: 'Error inesperado al reactivar el item' 
    };
  }
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



//  Eliminar físicamente un item 
 // Solo se usa cuando falla la creación del item
 
export async function eliminarItemMalCreado(id) {
  try {
    const { error } = await supabaseAdmin
      .from('item')
      .delete()
      .eq('id_item', id);

    if (error) {
      console.error('Error al eliminar item físicamente:', error);
      return {
        ok: false,
        error: 'Error al eliminar el item'
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('Error al eliminar item físicamente:', error);
    return {
      ok: false,
      error: 'Error inesperado al eliminar el item'
    };
  }
}