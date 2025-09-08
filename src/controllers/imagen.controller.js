import { z } from 'zod';
import { 
  subirImagenCuento, 
  obtenerURLImagen, 
  eliminarImagenCuento, 
  listarImagenesCuentos 
} from '../services/imagen.service.js';

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function subirImagenController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Archivo de imagen requerido' 
      });
    }

    // Validar que sea imagen
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Solo se permiten archivos de imagen (JPG, PNG, WebP)' 
      });
    }

    // Validar tamaño (máximo 5MB para imágenes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La imagen no puede superar los 5MB' 
      });
    }

    const result = await subirImagenCuento(id, req.file.buffer, req.file.originalname);
    
    res.status(201).json({ 
      ok: true, 
      data: result,
      message: 'Imagen de portada subida exitosamente' 
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

export async function obtenerURLImagenController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const url = await obtenerURLImagen(id);
    
    res.json({ 
      ok: true, 
      data: { url },
      message: 'URL obtenida exitosamente' 
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

export async function eliminarImagenController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarImagenCuento(id);
    
    res.json({ 
      ok: true, 
      ...result 
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

export async function listarImagenesController(req, res, next) {
  try {
    const result = await listarImagenesCuentos();
    res.json({ 
      ok: true, 
      data: result 
    });
  } catch (error) {
    next(error);
  }
}
