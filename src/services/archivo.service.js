import { supabaseAdmin } from '../config/supabase.js';

export async function subirPDFCuento(cuentoId, archivoBuffer, nombreArchivo) {
  try {
    // Subir archivo a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cuentos-pdfs')
      .upload(`cuento-${cuentoId}.pdf`, archivoBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true // Sobrescribir si existe
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
