import { supabaseAdmin } from '../config/supabase.js';

export async function subirImagenLogro(logroId, archivoBuffer, nombreArchivo) {
  try {
    const now = new Date();
    const carpeta = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
    const fileExt = nombreArchivo.split('.').pop();
    const timestamp = Date.now();
    const path = `${carpeta}/logro-${logroId}-${timestamp}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from('logros')
      .upload(path, archivoBuffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    
    const { data: urlData } = supabaseAdmin.storage
      .from('logros')
      .getPublicUrl(data.path);

    
    const { error: updateError } = await supabaseAdmin
      .from('logros')
      .update({ url_imagen: urlData.publicUrl })
      .eq('id_logros', logroId);

    if (updateError) {
      throw new Error(`Error al actualizar logro: ${updateError.message}`);
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

export function validarTipoImagenLogro(mimetype) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  return tiposPermitidos.includes(mimetype);
}