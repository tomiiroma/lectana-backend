import { supabaseAdmin } from '../config/supabase.js';

export async function subirPDFCuento(cuentoId, archivoBuffer, nombreArchivo) {
  try {
    const now = new Date();
    const carpeta = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}`;
    const path = `${carpeta}/cuento-${cuentoId}.pdf`;

    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-pdfs')
      .upload(path, archivoBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Error al subir PDF: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('cuentos-pdfs')
      .getPublicUrl(data.path);

    // Actualizar la tabla cuentos con la URL del PDF
    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ pdf_url: urlData.publicUrl })
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
    throw new Error(`Error en subida de archivo: ${error.message}`);
  }
}

export async function obtenerURLPDF(cuentoId) {
  try {
    const { data } = supabaseAdmin.storage
      .from('cuentos-pdfs')
      .getPublicUrl(`cuento-${cuentoId}.pdf`);

    return data.publicUrl;
  } catch (error) {
    throw new Error(`Error al obtener URL: ${error.message}`);
  }
}

export async function eliminarPDFCuento(cuentoId) {
  try {
    // Eliminar archivo de Storage
    const { error } = await supabaseAdmin.storage
      .from('cuentos-pdfs')
      .remove([`cuento-${cuentoId}.pdf`]);

    if (error) {
      throw new Error(`Error al eliminar PDF: ${error.message}`);
    }

    // Limpiar URL de la tabla cuentos
    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ pdf_url: null })
      .eq('id_cuento', cuentoId);

    if (updateError) {
      throw new Error(`Error al actualizar cuento: ${updateError.message}`);
    }

    return { message: 'PDF eliminado exitosamente' };
  } catch (error) {
    throw new Error(`Error en eliminación: ${error.message}`);
  }
}

export async function listarArchivosCuentos() {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-pdfs')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (error) {
      throw new Error(`Error al listar archivos: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Error en listado: ${error.message}`);
  }
}

export async function subirAudio(cuentoId, archivoBuffer, nombreArchivo) {
  const filePath = `audios/${nombreArchivo}`; // ruta en el bucket

  try {
    // 1️⃣ Subir archivo MP3 al bucket 'cuentos-audio'
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-audio')
      .upload(filePath, archivoBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Error al subir audio: ${error.message}`);
    }

    // 2️⃣ Obtener URL pública del audio
    const { data: urlData } = supabaseAdmin.storage
      .from('cuentos-audio')
      .getPublicUrl(filePath);

    // 3️⃣ Actualizar la tabla 'cuento' con la URL del audio
    const { error: updateError } = await supabaseAdmin
      .from('cuento')
      .update({ audio_url: urlData.publicUrl })
      .eq('id_cuento', cuentoId);

    if (updateError) {
      throw new Error(`Error al actualizar cuento: ${updateError.message}`);
    }

    // 4️⃣ Retornar información útil
    return {
      path: filePath,
      url: urlData.publicUrl,
      size: archivoBuffer.length
    };
  } catch (error) {
    throw new Error(`Error en subida de audio: ${error.message}`);
  }
}