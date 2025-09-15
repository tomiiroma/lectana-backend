import { supabaseAdmin } from '../config/supabase.js';
import multer from 'multer';
import path from 'path';

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();

// Configuración para un solo archivo
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configuración para múltiples archivos
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 10 // Máximo 10 archivos
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

/**
 * Subir imagen a Supabase Storage
 */
export async function subirImagen(archivo, carpeta = 'items') {
  try {
    // Generar nombre único para el archivo
    const extension = path.extname(archivo.originalname);
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    const rutaCompleta = `${carpeta}/${nombreUnico}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('imagenes')
      .upload(rutaCompleta, archivo.buffer, {
        contentType: archivo.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabaseAdmin.storage
      .from('imagenes')
      .getPublicUrl(rutaCompleta);

    return {
      nombre_archivo: nombreUnico,
      ruta: rutaCompleta,
      url_publica: urlData.publicUrl,
      tamaño: archivo.size,
      tipo_mime: archivo.mimetype
    };
  } catch (error) {
    throw new Error(`Error al procesar imagen: ${error.message}`);
  }
}

// Subir imagen de cuento al bucket cuentos-imagenes
export async function subirImagenCuento(archivo) {
  try {
    const extension = path.extname(archivo.originalname).toLowerCase();
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    const rutaCompleta = `${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${nombreUnico}`;

    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-imagenes')
      .upload(rutaCompleta, archivo.buffer, {
        contentType: archivo.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('cuentos-imagenes')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: archivo.size,
      mime: archivo.mimetype
    };
  } catch (error) {
    throw new Error(`Error al procesar imagen de cuento: ${error.message}`);
  }
}

export async function subirImagenYAsociarCuento(cuentoId, archivo) {
  try {
    const resultado = await subirImagenCuento(archivo);

    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ url_img: resultado.url })
      .eq('id_cuento', cuentoId);

    if (updateError) {
      throw new Error(`Error al actualizar cuento: ${updateError.message}`);
    }

    return resultado;
  } catch (error) {
    throw new Error(`Error al asociar imagen al cuento: ${error.message}`);
  }
}

/**
 * Eliminar imagen de Supabase Storage
 */
export async function eliminarImagen(rutaImagen) {
  try {
    const { error } = await supabaseAdmin.storage
      .from('imagenes')
      .remove([rutaImagen]);

    if (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }

    return { message: 'Imagen eliminada exitosamente' };
  } catch (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}

/**
 * Obtener URL pública de una imagen
 */
export async function obtenerUrlPublica(rutaImagen) {
  try {
    const { data } = supabaseAdmin.storage
      .from('imagenes')
      .getPublicUrl(rutaImagen);

    return data.publicUrl;
  } catch (error) {
    throw new Error(`Error al obtener URL: ${error.message}`);
  }
}

/**
 * Listar todas las imágenes en una carpeta
 */
export async function listarImagenes(carpeta = 'items') {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('imagenes')
      .list(carpeta, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Error al listar imágenes: ${error.message}`);
    }

    // Agregar URLs públicas a cada imagen
    const imagenesConUrl = data.map(imagen => ({
      ...imagen,
      url_publica: obtenerUrlPublica(`${carpeta}/${imagen.name}`)
    }));

    return imagenesConUrl;
  } catch (error) {
    throw new Error(`Error al listar imágenes: ${error.message}`);
  }
}

/**
 * Redimensionar imagen (opcional - para optimización)
 */
export async function redimensionarImagen(archivo, ancho = 300, alto = 300) {
  // Esta función requeriría una librería como 'sharp' para redimensionar
  // Por ahora retornamos el archivo original
  return archivo;
}

/**
 * Validar tipo de imagen permitido
 */
export function validarTipoImagen(tipoMime) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  return tiposPermitidos.includes(tipoMime);
}

/**
 * Obtener estadísticas de almacenamiento
 */
export async function obtenerEstadisticasAlmacenamiento() {
  try {
    const { data: items, error: itemsError } = await supabaseAdmin.storage
      .from('imagenes')
      .list('items');

    const { data: avatares, error: avataresError } = await supabaseAdmin.storage
      .from('imagenes')
      .list('avatares');

    if (itemsError || avataresError) {
      throw new Error('Error al obtener estadísticas');
    }

    return {
      total_imagenes: (items?.length || 0) + (avatares?.length || 0),
      imagenes_items: items?.length || 0,
      imagenes_avatares: avatares?.length || 0
    };
  } catch (error) {
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
}