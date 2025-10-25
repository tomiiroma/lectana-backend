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
import { crearLogroSchema, actualizarLogroSchema, idSchema } from '../schemas/logroSchema.js';

async function subirImagenASupabase(file) {
  try {
    const nombreArchivo = `logro_${Date.now()}_${file.originalname}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('logros')
      .upload(nombreArchivo, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error subiendo imagen a Supabase:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
    

    const { data: urlData } = supabaseAdmin.storage
      .from('logros')
      .getPublicUrl(nombreArchivo);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error en subirImagenASupabase:', error);
    throw error;
  }
}

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
  
    const urlImagen = await subirImagenASupabase(req.file);
  
    
    const result = await crearLogro({
      ...dataValidada,
      url_imagen: urlImagen
    });
    
    console.log('✅ Logro creado exitosamente:', result);
    
    res.status(201).json({ 
      ok: true, 
      data: result,
      message: 'Logro creado exitosamente con imagen' 
    });
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
    const data = actualizarLogroSchema.parse(req.body);
    const result = await actualizarLogro(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
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
