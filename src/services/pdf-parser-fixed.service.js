import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Probar diferentes formas de importar pdf-parse
let pdfParse;
try {
  // Intentar importación ES6
  pdfParse = require('pdf-parse');
} catch (error) {
  console.error('Error al cargar pdf-parse:', error.message);
}

export async function extraerTextoPDF(cuentoId) {
  try {
    console.log(`📄 Extrayendo texto del PDF del cuento ${cuentoId}...`);

    // Obtener la URL del PDF desde la base de datos
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { data: cuento, error: cuentoError } = await supabaseAdmin
      .from('cuento')
      .select('pdf_url')
      .eq('id_cuento', cuentoId)
      .single();

    if (cuentoError || !cuento) {
      throw new Error(`Cuento ${cuentoId} no encontrado`);
    }

    if (!cuento.pdf_url) {
      throw new Error(`El cuento ${cuentoId} no tiene PDF asociado`);
    }

    console.log(`📄 Descargando PDF desde: ${cuento.pdf_url}`);

    // Descargar el PDF desde Supabase Storage
    const pdfResponse = await fetch(cuento.pdf_url);
    if (!pdfResponse.ok) {
      throw new Error(`Error al descargar PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`📄 PDF descargado: ${pdfBuffer.byteLength} bytes`);
    
    // Extraer texto del PDF usando require
    console.log(`📄 Extrayendo texto...`);
    const pdfData = await pdfParse(Buffer.from(pdfBuffer));
    
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No se pudo extraer texto del PDF o el PDF está vacío');
    }

    // Limpiar el texto
    const textoLimpio = limpiarTexto(pdfData.text);
    
    console.log(`✅ Texto extraído exitosamente: ${textoLimpio.length} caracteres`);
    console.log(`📊 Palabras: ${textoLimpio.split(/\s+/).length}`);
    
    return textoLimpio;
  } catch (error) {
    console.error('❌ Error al extraer texto del PDF:', error.message);
    throw new Error(`Error al extraer texto del PDF: ${error.message}`);
  }
}

function limpiarTexto(texto) {
  return texto
    // Eliminar caracteres especiales y saltos de línea múltiples
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Eliminar espacios múltiples
    .replace(/[ \t]{2,}/g, ' ')
    // Eliminar caracteres de control
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limpiar espacios al inicio y final
    .trim();
}

export function validarTextoParaTTS(texto) {
  const errores = [];
  const advertencias = [];

  // Validaciones básicas
  if (!texto || texto.trim().length === 0) {
    errores.push('El texto está vacío');
  }

  if (texto.length < 10) {
    errores.push('El texto es demasiado corto (mínimo 10 caracteres)');
  }

  if (texto.length > 50000) {
    errores.push('El texto es demasiado largo (máximo 50,000 caracteres)');
  }

  // Advertencias
  if (texto.length > 20000) {
    advertencias.push('Texto muy largo, puede tardar en procesarse');
  }

  const caracteresEspeciales = texto.match(/[^\w\s.,!?;:()\-'"]/g);
  if (caracteresEspeciales && caracteresEspeciales.length > texto.length * 0.1) {
    advertencias.push('Muchos caracteres especiales detectados');
  }

  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
    estadisticas: {
      longitud: texto.length,
      palabras: texto.split(/\s+/).length,
      lineas: texto.split('\n').length
    }
  };
}








