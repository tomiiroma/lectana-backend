import { z } from 'zod';
import { 
  crearLogro, 
  obtenerLogroPorId, 
  listarLogros, 
  actualizarLogro, 
  eliminarLogro,
  verificarLogros,
  obtenerLogrosAlumno
} from '../services/logro.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { subirImagenLogro, eliminarImagenLogro } from '../services/logro.imagen.service.js';
import { crearLogroSchema, actualizarLogroSchema, idSchema } from '../schemas/logroSchema.js';


export async function crearLogroController(req, res, next) {
  try {
    
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La imagen es obligatoria para crear un logro' 
      });
    }


    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Solo se aceptan imágenes JPG, PNG, GIF o WebP' 
      });
    }

   
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La imagen es demasiado grande. Máximo 5MB' 
      });
    }

    
    const dataValidada = crearLogroSchema.parse(req.body);
    
  
    const result = await crearLogro({
      ...dataValidada,
      url_imagen: null 
    });
    
    console.log(' Logro creado con ID:', result.id_logros);
    
    
    try {
      const { url: urlImagen } = await subirImagenLogro(
        result.id_logros, 
        req.file.buffer, 
        req.file.originalname
      );
      
      console.log(' Imagen subida:', urlImagen);
      
      
      const logroActualizado = await actualizarLogro(result.id_logros, {
        url_imagen: urlImagen
      });
      
      console.log(' Logro actualizado con imagen');
      
      res.status(201).json({ 
        ok: true, 
        data: logroActualizado,
        message: 'Logro creado exitosamente con imagen' 
      });
    } catch (imageError) {
      
      console.error(' Error al subir imagen, eliminando logro...');
      await eliminarLogro(result.id_logros);
      throw new Error(`Error al procesar imagen: ${imageError.message}`);
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(' Error de validación:', error.errors);
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.errors
      });
    }
    console.error(' Error en crearLogroController:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}


export async function obtenerLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerLogroPorId(id);
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

export async function listarLogrosController(req, res, next) {
  try {
    const result = await listarLogros();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    console.log(' Actualizando logro:', id);
    console.log(' Datos:', req.body);
    console.log(' Nueva imagen:', req.file ? req.file.originalname : 'No hay nueva imagen');
    
    
    const logroActual = await obtenerLogroPorId(id);
    

    const dataValidada = actualizarLogroSchema.parse(req.body);
    
  
    if (req.file) {
      
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          ok: false, 
          error: 'Solo se aceptan imágenes JPG, PNG, GIF o WebP' 
        });
      }

      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          ok: false, 
          error: 'La imagen es demasiado grande. Máximo 5MB' 
        });
      }

      try {
        console.log('Subiendo nueva imagen...');
        
      
        const { url: nuevaUrl } = await subirImagenLogro(id, req.file.buffer, req.file.originalname);
        
        console.log('Nueva imagen subida:', nuevaUrl);
        
        
        if (logroActual.url_imagen) {
          console.log(' Eliminando imagen antigua:', logroActual.url_imagen);
          await eliminarImagenLogro(logroActual.url_imagen);
        }
        
        
        dataValidada.url_imagen = nuevaUrl;
      } catch (imageError) {
        console.error('Error procesando imagen:', imageError);
        return res.status(500).json({
          ok: false,
          error: `Error al procesar imagen: ${imageError.message}`
        });
      }
    }
    
    
    const logroActualizado = await actualizarLogro(id, dataValidada);
    
    console.log(' Logro actualizado exitosamente');
    
    res.json({ 
      ok: true, 
      data: logroActualizado,
      message: 'Logro actualizado exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.errors 
      });
    }
    console.error(' Error en actualizarLogroConImagenController:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error interno del servidor'
    });
  }
}

export async function eliminarLogroController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarLogro(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function verificarLogrosController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await verificarLogros(usuarioId);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function obtenerLogrosAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerLogrosAlumno(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}
