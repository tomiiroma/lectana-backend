import { z } from 'zod';
import { 
  crearItem, 
  obtenerItemPorId, 
  obtenerItems,
  actualizarItem, 
  eliminarItem,
  reactivarItem,
  obtenerUrlImagenItem,
  obtenerEstadisticasItems,
   obtenerItemsDisponiblesParaAlumno, 
  obtenerItemsCompradosPorAlumno,
  obtenerAlumnosPorItem,
  comprarItem 
} from '../services/item.service.js';
import { subirImagenItem, eliminarImagenItem } from '../services/item.imagen.service.js'
import { actualizarItemSchema, crearItemSchema, idSchema} from '../schemas/itemSchema.js';


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
      console.error('Error al subir imagen, eliminando item.');
      await eliminarItemMalCreado(result.data.id_item);
      throw new Error(`Error al cargar la imagen: ${imageError.message}`);
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


// Actualizar item

export async function actualizarItemController(req, res, next) {
  try {
    const { id } = req.params;


    const dataValidada = actualizarItemSchema.parse(req.body);

   
    if (req.file) {
      console.log('Nueva imagen detectada');

      
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

      
      const resultadoUrl = await obtenerUrlImagenItem(id);

      if (!resultadoUrl.ok) {
        return res.status(404).json({
          ok: false,
          error: resultadoUrl.error
        });
      }

      try {
        
        const { url: nuevaUrlImagen } = await subirImagenItem(
          id,
          req.file.buffer,
          req.file.originalname
        );

        console.log('Nueva imagen subida:', nuevaUrlImagen);

        dataValidada.url_imagen = nuevaUrlImagen;

       
        if (resultadoUrl.url_imagen) {
          await eliminarImagenItem(resultadoUrl.url_imagen);
          console.log('Imagen antigua eliminada');
        }
      } catch (imageError) {
        console.error('Error al procesar imagen:', imageError);
        return res.status(500).json({
          ok: false,
          error: `Error al procesar imagen: ${imageError.message}`
        });
      }
    }

    const result = await actualizarItem(id, dataValidada);

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }

  
    res.json({
      ok: true,
      data: result.data,
      message: 'Item actualizado exitosamente'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación:', error.errors);
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.errors
      });
    }
    console.error('Error en actualizarItemController:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}


//Deshabilitar item

export async function deshabilitarItemController(req, res, next) {
  try {
    const { id } = req.params;
    const result = await eliminarItem(id);

    if (!result.ok) {
      return res.status(400).json({ 
        ok: false, 
        error: result.error 
      });
    }

    res.json({ 
      ok: true, 
      message: result.data.message,
      data: result.data.item
    });

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


// Android 

// Mostar items que no han sido comprados y estan disponibles. 

export async function obtenerItemsDisponiblesController(req, res, next) {
  try {
    const usuarioId = req.user.sub; 
    
    const result = await obtenerItemsDisponiblesParaAlumno(usuarioId); 
    
    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }
    
    res.json({
      ok: true,
      data: result.data,
      total: result.data.length
    });
  } catch (error) {
    console.error('Error en obtenerItemsDisponiblesController:', error);
    next(error);
  }
}

// Mostrar items del alumno.
export async function obtenerItemsCompradosController(req, res, next) {
  try {
    const usuarioId = req.user.sub; 
    
    const result = await obtenerItemsCompradosPorAlumno(usuarioId); 
    
    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }
    
    res.json({
      ok: true,
      data: result.data,
      total: result.data.length
    });
  } catch (error) {
    console.error('Error en obtenerItemsCompradosController:', error);
    next(error);
  }
}


// --------------------------------------------- Compras ----------------------------------------------------------


//  Compra de un avatar
 
 export async function comprarItemController(req, res, next) {
  try {
    
    const { id } = idSchema.parse(req.params);
    const usuarioId = req.user.sub;

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        error: 'Usuario no autenticado'
      });
    }

    const resultado = await comprarItem(usuarioId, id);

    if (!resultado.ok) {
      
      if (resultado.error.includes('no existe')) {
        return res.status(404).json({
          ok: false,
          error: resultado.error
        });
      }
      
      
      if (
        resultado.error.includes('insuficientes') ||
        resultado.error.includes('Ya tienes') ||
        resultado.error.includes('no está disponible')
      ) {
        return res.status(400).json({
          ok: false,
          error: resultado.error
        });
      }

    
      return res.status(500).json({
        ok: false,
        error: resultado.error
      });
    }

    // Resultado de la compra
    res.status(201).json({
      ok: true,
      compra: resultado.compra,
      item: resultado.item,
      puntosActuales: resultado.puntosActuales,
      puntosGastados: resultado.puntosGastados,
       logrosDesbloqueados: resultado.logrosDesbloqueados || [],
      mensaje: resultado.mensaje,
       mensajeLogros: resultado.logrosDesbloqueados?.length > 0
        ? `🏆 ¡Desbloqueaste ${resultado.logrosDesbloqueados.length} logro(s)!`
        : null
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'ID de item inválido',
        detalles: error.flatten()
      });
    }
    
    console.error('Error en comprarItemController:', error);
    next(error);
  }
}


//  Obtiene todos los alumnos que compraron un item específico
 
export async function obtenerAlumnosPorItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    const resultado = await obtenerAlumnosPorItem(id);
    
    if (!resultado.ok) {
      if (resultado.error.includes('no existe')) {
        return res.status(404).json({
          ok: false,
          error: resultado.error
        });
      }
      
      return res.status(400).json({
        ok: false,
        error: resultado.error
      });
    }
    
    res.json({
      ok: true,
      item: resultado.item,
      alumnos: resultado.alumnos,
      total: resultado.total
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.flatten()
      });
    }
    
    console.error('Error en obtenerAlumnosPorItemController:', error);
    next(error);
  }
}
