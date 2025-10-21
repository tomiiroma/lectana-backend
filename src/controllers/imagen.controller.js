import { z } from 'zod';
import { 
  subirImagen, 
  eliminarImagen, 
  listarImagenes, 
  obtenerEstadisticasAlmacenamiento,
  validarTipoImagen,
  subirImagenCuento,
  subirImagenYAsociarCuento 
} from '../services/imagen.service.js';

import { subirImagenSchema } from '../schemas/imagenSchema.js';

const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});


export async function subirImagenController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'No se proporcionó ningún archivo' 
      });
    }

    // Validar tipo de imagen
    if (!validarTipoImagen(req.file.mimetype)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, GIF, WebP' 
      });
    }

    // Validar tamaño (máximo 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El archivo es demasiado grande. Máximo 5MB' 
      });
    }

    const { carpeta } = subirImagenSchema.parse(req.body);
    
    const resultado = await subirImagen(req.file, carpeta);
    
    res.status(201).json({ 
      ok: true, 
      data: resultado,
      message: 'Imagen subida exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

export async function subirImagenCuentoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No se proporcionó ningún archivo' });
    }

    if (!['image/jpeg','image/jpg','image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ ok: false, error: 'Solo se aceptan JPG o PNG' });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'El archivo es demasiado grande. Máximo 10MB' });
    }

    const resultado = await subirImagenYAsociarCuento(id, req.file);
    res.status(201).json({ ok: true, data: resultado, message: 'Imagen subida exitosamente' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

export async function uploadImagenYAsociarCuentoController(req, res, next) {
  try {
    const cuentoId = req.params.id;
    if (!cuentoId) {
      return res.status(400).json({ ok: false, error: 'ID de cuento requerido' });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No se proporcionó ningún archivo' });
    }

    if (!['image/jpeg','image/jpg','image/png'].includes(req.file.mimetype)) {
      return res.status(400).json({ ok: false, error: 'Solo se aceptan JPG o PNG' });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'El archivo es demasiado grande. Máximo 10MB' });
    }

    const resultado = await subirImagenYAsociarCuento(cuentoId, req.file);
    res.status(201).json({ ok: true, data: resultado, message: 'Imagen subida y asociada exitosamente' });
  } catch (error) {
    next(error);
  }
}

export async function eliminarImagenController(req, res, next) {
  try {
    const { ruta } = req.body;
    
    if (!ruta) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Ruta de imagen requerida' 
      });
    }

    const resultado = await eliminarImagen(ruta);
    
    res.json({ 
      ok: true, 
      data: resultado,
      message: 'Imagen eliminada exitosamente' 
    });
  } catch (error) {
    next(error);
  }
}

export async function listarImagenesController(req, res, next) {
  try {
    const { carpeta = 'items' } = req.query;
    
    const resultado = await listarImagenes(carpeta);
    
    res.json({ 
      ok: true, 
      data: resultado 
    });
  } catch (error) {
    next(error);
  }
}

export async function obtenerEstadisticasAlmacenamientoController(req, res, next) {
  try {
    const resultado = await obtenerEstadisticasAlmacenamiento();
    
    res.json({ 
      ok: true, 
      data: resultado 
    });
  } catch (error) {
    next(error);
  }
}

export async function subirMultipleImagenesController(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'No se proporcionaron archivos' 
      });
    }

    const { carpeta } = subirImagenSchema.parse(req.body);
    const resultados = [];

    for (const archivo of req.files) {
      // Validar cada archivo
      if (!validarTipoImagen(archivo.mimetype)) {
        continue; // Saltar archivos inválidos
      }

      if (archivo.size > 5 * 1024 * 1024) {
        continue; // Saltar archivos muy grandes
      }

      try {
        const resultado = await subirImagen(archivo, carpeta);
        resultados.push(resultado);
      } catch (error) {
        console.error(`Error al subir ${archivo.originalname}:`, error.message);
        // Continuar con los demás archivos
      }
    }

    res.status(201).json({ 
      ok: true, 
      data: resultados,
      message: `${resultados.length} imágenes subidas exitosamente` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}