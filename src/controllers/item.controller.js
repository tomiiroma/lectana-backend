import { z } from 'zod';
import { 
  crearItem, 
  obtenerItemPorId, 
  obtenerItems,
  obtenerItemsPorCategoria,
  actualizarItem, 
  eliminarItem,
  desbloquearItem,
  obtenerItemsDesbloqueados,
  verificarItemDesbloqueado,
  obtenerEstadisticasItems
} from '../services/item.service.js';
import { subirImagenItem, eliminarImagenItem } from '../services/item.imagen.service.js'
import { actualizarItemSchema, crearItemSchema, idSchema, categoriaSchema, tipoSchema } from '../schemas/itemSchema.js';



export async function crearItemController(req, res, next) {
  try {
    
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La imagen es obligatoria para crear un item' 
      });
    }

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Solo se aceptan imágenes JPG, PNG, WebP o GIF' 
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La imagen es demasiado grande. Máximo 5MB' 
      });
    }

    const dataValidada = crearItemSchema.parse(req.body);
    
    const result = await crearItem({
      ...dataValidada,
      url_imagen: null 
    });
    
    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }
    
    console.log('Item creado con ID:', result.data.id_item);
    
    try {
      const { url: urlImagen } = await subirImagenItem(
        result.data.id_item, 
        req.file.buffer, 
        req.file.originalname
      );
      
      console.log('Imagen subida:', urlImagen);
      
      const itemActualizado = await actualizarItem(result.data.id_item, {
        url_imagen: urlImagen
      });
      
      console.log('Item actualizado con imagen');
      
      res.status(201).json({ 
        ok: true, 
        data: itemActualizado,
        message: 'Item creado exitosamente con imagen' 
      });
    } catch (imageError) {
      console.error('Error al subir imagen, eliminando item físicamente...');
      await eliminarItemMalCreado(result.data.id_item);
      throw new Error(`Error al procesar imagen: ${imageError.message}`);
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.errors
      });
    }
    console.error('Error en crearItemController:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}

export async function obtenerItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerItemPorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function listarItemsController(req, res, next) {
  try {
    const result = await obtenerItems();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listarItemsPorCategoriaController(req, res, next) {
  try {
    const { categoria } = categoriaSchema.parse(req.params);
    const result = await obtenerItemsPorCategoria(categoria);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}


export async function actualizarItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarItemSchema.parse(req.body);
    const result = await actualizarItem(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}


//Deshabilitar item

export async function deshabilitarItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarItem(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

// reactivar item
export async function reactivarItemController(req, res, next) {
  try {
    const { id } = req.params;
    const result = await reactivarItem(id);
    
    if (!result.ok) {
      return res.status(400).json({ 
        ok: false, 
        error: result.error 
      });
    }
    
    res.json({ 
      ok: true, 
      message: result.data.message,
      data: result.data 
    });
  } catch (error) {
    next(error);
  }
}

export async function desbloquearItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const usuarioId = req.user.sub;
    
    const result = await desbloquearItem(usuarioId, id);
    res.json({ ok: true, data: result, message: 'Item desbloqueado exitosamente' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('ya está desbloqueado')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerItemsDesbloqueadosController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerItemsDesbloqueados(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verificarItemDesbloqueadoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const usuarioId = req.user.sub;
    
    const result = await verificarItemDesbloqueado(usuarioId, id);
    res.json({ ok: true, data: { desbloqueado: result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerEstadisticasItemsController(req, res, next) {
  try {
    const result = await obtenerEstadisticasItems();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}
