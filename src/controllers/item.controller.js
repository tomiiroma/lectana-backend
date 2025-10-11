import { z } from 'zod';
import { 
  crearItem, 
  obtenerItemPorId, 
  obtenerItems,
  obtenerItemsPorCategoria,
  obtenerItemsPorTipo,
  actualizarItem, 
  eliminarItem,
  desbloquearItem,
  obtenerItemsDesbloqueados,
  verificarItemDesbloqueado,
  obtenerEstadisticasItems
} from '../services/item.service.js';
import { subirImagen, eliminarImagen } from '../services/imagen.service.js';
import { actualizarItemSchemam, crearItemSchema, idSchema, categoriaSchema, tipoSchema } from '../schemas/itemSchema.js';


export async function crearItemController(req, res, next) {
  try {
    const data = crearItemSchema.parse(req.body);
    const result = await crearItem(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function crearItemConImagenController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Se requiere una imagen para crear el item' 
      });
    }

    // Subir imagen primero
    const imagenResultado = await subirImagen(req.file, 'items');
    
    // Crear item con la URL de la imagen
    const data = crearItemSchema.parse({
      ...req.body,
      url_imagen: imagenResultado.url_publica
    });
    
    const result = await crearItem(data);
    
    res.status(201).json({ 
      ok: true, 
      data: {
        ...result,
        imagen_info: {
          nombre_archivo: imagenResultado.nombre_archivo,
          ruta: imagenResultado.ruta,
          tamaño: imagenResultado.tamaño
        }
      },
      message: 'Item creado con imagen exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
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

export async function listarItemsPorTipoController(req, res, next) {
  try {
    const { tipo } = tipoSchema.parse(req.params);
    const result = await obtenerItemsPorTipo(tipo);
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

export async function eliminarItemController(req, res, next) {
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
