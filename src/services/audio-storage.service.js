import { supabaseAdmin } from '../config/supabase.js';

/**
 * Sube un archivo de audio a Supabase Storage
 * @param {number} cuentoId - ID del cuento
 * @param {Buffer} audioBuffer - Buffer del archivo de audio
 * @param {string} formato - Formato del audio (default: 'mp3')
 * @returns {Object} Información del archivo subido
 */
export async function subirAudioCuento(cuentoId, audioBuffer, formato = 'mp3') {
  try {
    console.log(`🎵 Subiendo audio del cuento ${cuentoId}...`);

    // Crear estructura de carpetas por fecha
    const now = new Date();
    const carpeta = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nombreArchivo = `cuento-${cuentoId}.${formato}`;
    const path = `${carpeta}/${nombreArchivo}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-audio')
      .upload(path, audioBuffer, {
        contentType: `audio/${formato}`,
        cacheControl: '3600',
        upsert: true // Sobrescribir si existe
      });

    if (error) {
      throw new Error(`Error al subir audio: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('cuentos-audio')
      .getPublicUrl(data.path);

    console.log(`✅ Audio subido exitosamente: ${urlData.publicUrl}`);

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: audioBuffer.length,
      formato: formato
    };
  } catch (error) {
    console.error('❌ Error al subir audio:', error.message);
    throw new Error(`Error al subir audio: ${error.message}`);
  }
}

/**
 * Actualiza la información del audio en la base de datos
 * @param {number} cuentoId - ID del cuento
 * @param {string} audioUrl - URL del archivo de audio
 * @param {number} duracion - Duración en segundos
 * @param {number} tamaño - Tamaño del archivo en bytes
 * @returns {Object} Resultado de la actualización
 */
export async function actualizarAudioEnBD(cuentoId, audioUrl, duracion, tamaño) {
  try {
    console.log(`💾 Actualizando información de audio en BD para cuento ${cuentoId}...`);

    const { data, error } = await supabaseAdmin
      .from('cuento')
      .update({
        audio_url: audioUrl,
        audio_duration: duracion,
        audio_status: 'ready',
        audio_created_at: new Date().toISOString()
      })
      .eq('id_cuento', cuentoId)
      .select('id_cuento, titulo, audio_url, audio_duration, audio_status')
      .single();

    if (error) {
      throw new Error(`Error al actualizar BD: ${error.message}`);
    }

    console.log(`✅ Información de audio actualizada en BD`);
    return data;
  } catch (error) {
    console.error('❌ Error al actualizar BD:', error.message);
    throw new Error(`Error al actualizar BD: ${error.message}`);
  }
}

/**
 * Obtiene la información del audio de un cuento
 * @param {number} cuentoId - ID del cuento
 * @returns {Object} Información del audio
 */
export async function obtenerInfoAudio(cuentoId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('cuento')
      .select('audio_url, audio_duration, audio_status, audio_created_at')
      .eq('id_cuento', cuentoId)
      .single();

    if (error) {
      throw new Error(`Error al obtener info de audio: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error al obtener info de audio:', error.message);
    throw new Error(`Error al obtener info de audio: ${error.message}`);
  }
}

/**
 * Elimina el archivo de audio de un cuento
 * @param {number} cuentoId - ID del cuento
 * @returns {Object} Resultado de la eliminación
 */
export async function eliminarAudioCuento(cuentoId) {
  try {
    console.log(`🗑️ Eliminando audio del cuento ${cuentoId}...`);

    // Obtener información del audio
    const infoAudio = await obtenerInfoAudio(cuentoId);
    
    if (!infoAudio.audio_url) {
      throw new Error(`El cuento ${cuentoId} no tiene audio asociado`);
    }

    // Extraer el path del archivo desde la URL
    const url = new URL(infoAudio.audio_url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'cuentos-audio');
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Eliminar archivo de Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('cuentos-audio')
      .remove([filePath]);

    if (storageError) {
      throw new Error(`Error al eliminar archivo: ${storageError.message}`);
    }

    // Limpiar información en BD
    const { error: dbError } = await supabaseAdmin
      .from('cuento')
      .update({
        audio_url: null,
        audio_duration: null,
        audio_status: null,
        audio_created_at: null
      })
      .eq('id_cuento', cuentoId);

    if (dbError) {
      throw new Error(`Error al limpiar BD: ${dbError.message}`);
    }

    console.log(`✅ Audio eliminado exitosamente`);
    return { message: 'Audio eliminado exitosamente' };
  } catch (error) {
    console.error('❌ Error al eliminar audio:', error.message);
    throw new Error(`Error al eliminar audio: ${error.message}`);
  }
}

/**
 * Verifica si un cuento ya tiene audio generado
 * @param {number} cuentoId - ID del cuento
 * @returns {boolean} True si tiene audio, false si no
 */
export async function tieneAudio(cuentoId) {
  try {
    const infoAudio = await obtenerInfoAudio(cuentoId);
    return !!(infoAudio.audio_url && infoAudio.audio_status === 'ready');
  } catch (error) {
    return false;
  }
}

