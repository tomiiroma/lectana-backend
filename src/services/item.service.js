import { supabaseAdmin } from '../config/supabase.js';
import { obtenerPuntosPorUsuario, restarPuntos   } from './puntos.service.js';
import { procesarEvento, obtenerContador } from './logro.eventos.service.js';

const TIPOS_MOVIMIENTO = {
  COMPRA: 'compra'
};

  // Obtener id_alumno desde id_usuario
 
async function obtenerIdAlumnoPorUsuario(usuarioId) {
    const { data: alumno, error } = await supabaseAdmin
    .from('alumno')
    .select('id_alumno')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  return alumno.id_alumno;
}

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

// Actualizar item

export async function actualizarItem(id, data) {
  try {
    
    const { data: itemExistente, error: errorBusqueda } = await supabaseAdmin
      .from('item')
      .select('*')
      .eq('id_item', id)
      .single();

    if (errorBusqueda || !itemExistente) {
      return {
        ok: false,
        error: 'Item no encontrado'
      };
    }

    
    if (data.precio !== undefined) {
      const precio = Number(data.precio);
      if (isNaN(precio) || precio < 1) {
        return {
          ok: false,
          error: 'El precio debe ser un número mayor o igual a 1'
        };
      }
      data.precio = precio;
    }

 
    const { data: itemActualizado, error: errorActualizacion } = await supabaseAdmin
      .from('item')
      .update(data)
      .eq('id_item', id)
      .select()
      .single();

    if (errorActualizacion) {
      console.error('Error al actualizar item:', errorActualizacion);
      return {
        ok: false,
        error: 'Error al actualizar el item'
      };
    }

    return {
      ok: true,
      data: itemActualizado
    };
  } catch (error) {
    console.error('Error inesperado al actualizar item:', error);
    return {
      ok: false,
      error: 'Error inesperado al actualizar el item'
    };
  }
}

 // Eliminar un item 
 
export async function eliminarItem(id) {
  try {
    


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
  
   const { data: itemActualizado, error: errorActualizacion } = await supabaseAdmin
      .from('item')
      .update({ disponible: false })
      .eq('id_item', id)
      .select()
      .single();

    if (errorActualizacion) {
      console.error('Error de Supabase:', errorActualizacion);
      return { 
        ok: false, 
        error: 'Error al deshabilitar el item' 
      };
    }

    return { 
      ok: true, 
      data: {
        item: itemActualizado,
        message: 'Item deshabilitado exitosamente.'
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


// Android

// Muestra los items disponibles para la tienda (Los items que compro el alumno ya no se muestran en la tienda.).

 
export async function obtenerItemsDisponiblesParaAlumno(usuarioId) {
  try {
    
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Usuario ID: ${usuarioId} → Alumno ID: ${alumnoId}`);

    const { data: itemsDisponibles, error: errorItems } = await supabaseAdmin
      .from('item')
      .select('*')
      .eq('disponible', true)
      .order('precio', { ascending: true });

    if (errorItems) {
      return {
        ok: false,
        error: errorItems.message || 'Error al obtener items disponibles'
      };
    }

    const { data: itemsComprados, error: errorComprados } = await supabaseAdmin
      .from('alumno_has_item')
      .select('item_id_item')
      .eq('alumno_id_alumno', alumnoId);

    if (errorComprados) {
      return {
        ok: false,
        error: errorComprados.message || 'Error al verificar items comprados'
      };
    }

    const idsComprados = itemsComprados.map(c => c.item_id_item);
    const itemsNoComprados = itemsDisponibles.filter(
      item => !idsComprados.includes(item.id_item)
    );

    return {
      ok: true,
      data: itemsNoComprados || []
    };
  } catch (error) {
    console.error('Error al obtener items disponibles para alumno:', error);
    return {
      ok: false,
      error: error.message || 'Error inesperado al obtener items disponibles'
    };
  }
}

// Muestra los items que el alumno compro

export async function obtenerItemsCompradosPorAlumno(usuarioId) {
  try {
    
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Usuario ID: ${usuarioId} → Alumno ID: ${alumnoId}`);

    const { data, error } = await supabaseAdmin
      .from('alumno_has_item')
      .select(`
        movimiento,
        fecha_canje,
        item:item_id_item (
          id_item,
          nombre,
          descripcion,
          precio,
          url_imagen,
          disponible
        )
      `)
      .eq('alumno_id_alumno', alumnoId)
      .order('fecha_canje', { ascending: false });

    if (error) {
      return {
        ok: false,
        error: error.message || 'Error al obtener items comprados'
      };
    }

    const itemsComprados = data.map(compra => ({
      ...compra.item,
      movimiento: compra.movimiento,
      fecha_compra: compra.fecha_canje
    }));

    return {
      ok: true,
      data: itemsComprados || []
    };
  } catch (error) {
    console.error('Error al obtener items comprados:', error);
    return {
      ok: false,
      error: error.message || 'Error inesperado al obtener items comprados'
    };
  }
}

// obtener url de la imagen

export async function obtenerUrlImagenItem(id) {
  try {
    const { data: item, error } = await supabaseAdmin
      .from('item')
      .select('url_imagen')
      .eq('id_item', id)
      .single();

    if (error || !item) {
      return {
        ok: false,
        error: 'Item no encontrado'
      };
    }

    return {
      ok: true,
      url_imagen: item.url_imagen
    };
  } catch (error) {
    console.error('Error al obtener URL de imagen:', error);
    return {
      ok: false,
      error: 'Error al obtener información del item'
    };
  }
}


// ------------------------------------------------  Compras de items -----------------------------------------------------------


 // Verifica si el alumno ya tiene el item
 
async function alumnoTieneItem(alumnoId, itemId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_item')
    .select('*')
    .eq('alumno_id_alumno', alumnoId)
    .eq('item_id_item', itemId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error al verificar item: ${error.message}`);
  }

  return !!data; 
}


 // Registrar la compra del item
 
async function registrarCompraItem(alumnoId, itemId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_item')
    .insert({
      alumno_id_alumno: alumnoId,
      item_id_item: itemId,
      movimiento: TIPOS_MOVIMIENTO.COMPRA,
      fecha_canje: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al registrar compra: ${error.message}`);
  }

  return data;
}



 // Comprar un item 

export async function comprarItem(usuarioId, itemId) {
  console.log(`Iniciando compra - Usuario: ${usuarioId}, Item: ${itemId}`);

  try {
    
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Alumno encontrado: ${alumnoId}`);

   
    const item = await obtenerItemPorId(itemId);
    if (!item) {
      throw new Error('El item no existe');
    }
    console.log(`Item encontrado: ${item.nombre} - Precio: ${item.precio} puntos`);

    
    if (!item.disponible) {
      throw new Error('Este item no está disponible para compra');
    }

    
    const yaLoTiene = await alumnoTieneItem(alumnoId, itemId);
    if (yaLoTiene) {
      throw new Error('Ya tienes este item');
    }

    // puntos del alumno
    const puntos = await obtenerPuntosPorUsuario(usuarioId);
    if (!puntos) {
      throw new Error('No se encontraron puntos para este alumno');
    }
    console.log(`Puntos del alumno: ${puntos.puntos}`);

    // Validar que tenga suficientes puntos
    if (puntos.puntos < item.precio) {
      throw new Error(
        `Puntos insuficientes. Tienes ${puntos.puntos} puntos, necesitas ${item.precio} puntos`
      );
    }

    // Descontar los puntos
    const puntosActualizados = await restarPuntos(alumnoId, item.precio);
    console.log(`Puntos descontados. Nuevos puntos: ${puntosActualizados.puntos}`);

  
    const compra = await registrarCompraItem(alumnoId, itemId);
    console.log(`Compra registrada exitosamente`);

      // ============================================
    
    // Obtener el total de avatares comprados 
    const totalAvatares = await obtenerContador(usuarioId, 'compras');


    // Procesar eventos de logros
    const { logrosDesbloqueados } = await procesarEvento(
      usuarioId,
      'compras', // o 'avatares' si prefieres ese nombre
      totalAvatares
    );

    if (logrosDesbloqueados.length > 0) {
      console.log(`Logros desbloqueados: ${logrosDesbloqueados.map(l => l.nombre).join(', ')}`);
    }


    return {
      ok: true,
      compra,
      item,
      puntosAnteriores: puntos.puntos,
      puntosActuales: puntosActualizados.puntos,
      puntosGastados: item.precio,
       logrosDesbloqueados,
      mensaje: `¡Compraste ${item.nombre}! Te quedan ${puntosActualizados.puntos} puntos`
    };

  } catch (error) {
    console.error('Error en comprarItem:', error.message);
    return {
      ok: false,
      error: error.message
    };
  }
}


 // Obtiene todos los alumnos que compraron un item específico


export async function obtenerAlumnosPorItem(itemId) {
  try {
    console.log(`Buscando alumnos que compraron el item ${itemId}`);

   
    const item = await obtenerItemPorId(itemId);
    if (!item) {
      return {
        ok: false,
        error: 'El item no existe'
      };
    }

    
    const { data: compras, error } = await supabaseAdmin
      .from('alumno_has_item')
      .select(`
        alumno_id_alumno,
        item_id_item,
        movimiento,
        fecha_canje,
        alumno:alumno_id_alumno (
          id_alumno,
          nacionalidad,
          alumno_col,
          aula_id_aula,
          usuario:usuario_id_usuario (
            id_usuario,
            nombre,
            apellido,
            email,
            edad
          )
        )
      `)
      .eq('item_id_item', itemId)
      .order('fecha_canje', { ascending: false });

    if (error) {
      console.error('Error al obtener alumnos:', error);
      return {
        ok: false,
        error: error.message || 'Error al obtener alumnos'
      };
    }

    
    const alumnosFormateados = compras.map(compra => ({
      
      alumno_id_alumno: compra.alumno_id_alumno,
      item_id_item: compra.item_id_item,
      movimiento: compra.movimiento,
      fecha_canje: compra.fecha_canje,
      
     
      alumno: {
        id_alumno: compra.alumno.id_alumno,
        nacionalidad: compra.alumno.nacionalidad,
        alumno_col: compra.alumno.alumno_col,
        aula_id_aula: compra.alumno.aula_id_aula,
        
       
        usuario: {
          id_usuario: compra.alumno.usuario.id_usuario,
          nombre: compra.alumno.usuario.nombre,
          apellido: compra.alumno.usuario.apellido,
          email: compra.alumno.usuario.email,
          edad: compra.alumno.usuario.edad
        }
      }
    }));

    console.log(`Se encontraron ${alumnosFormateados.length} alumnos`);

    return {
      ok: true,
      item: {
        id_item: item.id_item,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio
      },
      alumnos: alumnosFormateados,
      total: alumnosFormateados.length
    };

  } catch (error) {
    console.error('Error en obtenerAlumnosPorItem:', error);
    return {
      ok: false,
      error: error.message || 'Error al obtener alumnos'
    };
  }
}