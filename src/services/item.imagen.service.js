import { supabaseAdmin } from '../config/supabase.js';

export async function subirImagenItem(itemId, archivoBuffer, nombreArchivo) {
  try {
    const now = new Date();
    const carpeta = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
    const fileExt = nombreArchivo.split('.').pop();
    const timestamp = Date.now();
    const path = `${carpeta}/item-${itemId}-${timestamp}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from('avatares')
      .upload(path, archivoBuffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('avatares')
      .getPublicUrl(data.path);

    const { error: updateError } = await supabaseAdmin
      .from('item')
      .update({ url_imagen: urlData.publicUrl })
      .eq('id_item', itemId);

    if (updateError) {
      throw new Error(`Error al actualizar item: ${updateError.message}`);
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

export function validarTipoImagenItem(mimetype) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  return tiposPermitidos.includes(mimetype);
}

export async function eliminarImagenItem(urlImagen) {
  try {
    if (!urlImagen) return;
    
    const urlParts = urlImagen.split('/avatares/');
    if (urlParts.length < 2) {
      console.log('URL de imagen inválida:', urlImagen);
      return;
    }
    
    const filePath = urlParts[1];
    
    console.log('Eliminando imagen antigua:', filePath);
    
    const { error } = await supabaseAdmin.storage
      .from('avatares')
      .remove([filePath]);

    if (error) {
      console.error('Error al eliminar imagen:', error.message);
    } else {
      console.log('Imagen antigua eliminada');
    }
  } catch (error) {
    console.error('Error en eliminarImagenItem:', error);
  }
}