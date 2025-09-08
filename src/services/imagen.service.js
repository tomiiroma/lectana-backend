import { supabaseAdmin } from '../config/supabase.js';

export async function subirImagenCuento(cuentoId, archivoBuffer, nombreArchivo) {
  try {
    // Subir imagen a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-imagenes')
      .upload(`cuento-${cuentoId}-portada.jpg`, archivoBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Sobrescribir si existe
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('cuentos-imagenes')
      .getPublicUrl(data.path);

    // Actualizar la tabla cuentos con la URL de la imagen
    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ url_img: urlData.publicUrl })
      .eq('id_cuento', cuentoId);

    if (updateError) {
      throw new Error(`Error al actualizar cuento: ${updateError.message}`);
    }

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: archivoBuffer.length
    };
  } catch (error) {
    throw new Error(`Error en subida de imagen: ${error.message}`);
  }
}

export async function obtenerURLImagen(cuentoId) {
  try {
    const { data } = supabaseAdmin.storage
      .from('cuentos-imagenes')
      .getPublicUrl(`cuento-${cuentoId}-portada.jpg`);

    return data.publicUrl;
  } catch (error) {
    throw new Error(`Error al obtener URL: ${error.message}`);
  }
}

export async function eliminarImagenCuento(cuentoId) {
  try {
    // Eliminar imagen de Storage
    const { error } = await supabaseAdmin.storage
      .from('cuentos-imagenes')
      .remove([`cuento-${cuentoId}-portada.jpg`]);

    if (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }

    // Limpiar URL de la tabla cuentos
    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ url_img: null })
      .eq('id_cuento', cuentoId);

    if (updateError) {
      throw new Error(`Error al actualizar cuento: ${updateError.message}`);
    }

    return { message: 'Imagen eliminada exitosamente' };
  } catch (error) {
    throw new Error(`Error en eliminación: ${error.message}`);
  }
}

export async function listarImagenesCuentos() {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-imagenes')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (error) {
      throw new Error(`Error al listar imágenes: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Error en listado: ${error.message}`);
  }
}
