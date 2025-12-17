import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { 
  extraerTextoPDF, 
  validarTextoParaTTS 
} from '../services/pdf-parser.service.js';
import { generarAudio } from '../services/tts.service.js';
import { 
  subirAudioCuento, 
  actualizarAudioEnBD, 
  obtenerInfoAudio,
  eliminarAudioCuento,
  tieneAudio 
} from '../services/audio-storage.service.js';

const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

/**
 * Genera audio para un cuento específico
 */
export async function generarAudioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    console.log(` Iniciando generación de audio para cuento ${id}...`);

    // Verificar si ya existe audio
    const yaTieneAudio = await tieneAudio(id);
    if (yaTieneAudio) {
      const infoAudio = await obtenerInfoAudio(id);
      return res.json({
        ok: true,
        data: {
          audio_url: infoAudio.audio_url,
          duration: infoAudio.audio_duration,
          status: infoAudio.audio_status,
          message: 'El cuento ya tiene audio generado'
        }
      });
    }

    // Actualizar estado a "generating"
    await actualizarAudioEnBD(id, null, null, null);
    await supabaseAdmin
      .from('cuento')
      .update({ audio_status: 'generating' })
      .eq('id_cuento', id);

    // 1. Extraer texto del PDF
    console.log(' Extrayendo texto del PDF...');
    const texto = await extraerTextoPDF(id);

    // 2. Validar texto para TTS
    console.log(' Validando texto...');
    const validacion = validarTextoParaTTS(texto);
    
    if (!validacion.esValido) {
      await supabaseAdmin
        .from('cuento')
        .update({ audio_status: 'error' })
        .eq('id_cuento', id);
      
      return res.status(400).json({
        ok: false,
        error: 'Texto no válido para generar audio',
        detalles: validacion.errores
      });
    }

    // 3. Generar audio con TTS
    console.log('🎵 Generando audio con TTS...');
    const audioBuffer = await generarAudio(texto);

    // 4. Subir audio a Storage
    console.log('☁️ Subiendo audio a Storage...');
    const audioInfo = await subirAudioCuento(id, audioBuffer);

    // 5. Calcular duración estimada
    const duracionEstimada = Math.ceil(audioBuffer.length / 16000); // Estimación aproximada

    // 6. Actualizar base de datos
    console.log('💾 Actualizando base de datos...');
    const resultado = await actualizarAudioEnBD(
      id, 
      audioInfo.url, 
      duracionEstimada, 
      audioInfo.size
    );

    console.log(`✅ Audio generado exitosamente para cuento ${id}`);

    res.status(201).json({
      ok: true,
      data: {
        audio_url: audioInfo.url,
        duration: duracionEstimada,
        size: audioInfo.size,
        status: 'ready',
        estadisticas: validacion.estadisticas
      },
      message: 'Audio generado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en generación de audio:', error.message);
    
    // Actualizar estado a error
    try {
      await supabaseAdmin
        .from('cuento')
        .update({ audio_status: 'error' })
        .eq('id_cuento', req.params.id);
    } catch (updateError) {
      console.error('Error al actualizar estado:', updateError.message);
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.flatten()
      });
    }

    next(error);
  }
}

/**
 * Obtiene la información del audio de un cuento
 */
export async function obtenerAudioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    const infoAudio = await obtenerInfoAudio(id);
    
    if (!infoAudio.audio_url) {
      return res.status(404).json({
        ok: false,
        error: 'El cuento no tiene audio generado'
      });
    }

    res.json({
      ok: true,
      data: {
        audio_url: infoAudio.audio_url,
        duration: infoAudio.audio_duration,
        status: infoAudio.audio_status,
        created_at: infoAudio.audio_created_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.flatten()
      });
    }
    next(error);
  }
}

/**
 * Obtiene el estado de generación del audio
 */
export async function obtenerEstadoAudioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    const infoAudio = await obtenerInfoAudio(id);
    
    res.json({
      ok: true,
      data: {
        status: infoAudio.audio_status || 'not_generated',
        has_audio: !!infoAudio.audio_url,
        duration: infoAudio.audio_duration,
        created_at: infoAudio.audio_created_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.flatten()
      });
    }
    next(error);
  }
}

/**
 * Elimina el audio de un cuento
 */
export async function eliminarAudioController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    const resultado = await eliminarAudioCuento(id);
    
    res.json({
      ok: true,
      data: resultado,
      message: 'Audio eliminado exitosamente'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Validación fallida',
        detalles: error.flatten()
      });
    }
    next(error);
  }
}
