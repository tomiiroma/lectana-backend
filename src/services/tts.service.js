//import { ttsClient } from '../config/google-cloud.js';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';
dotenv.config();


/**
 * Genera audio a partir de texto usando Google Cloud TTS
 * @param {string} texto - Texto a convertir a audio
 * @param {Object} opciones - Opciones de configuración
 * @returns {Buffer} Buffer del archivo de audio MP3
 */
export async function generarAudio(texto, opciones = {}) {
  try {
    if (!texto || texto.trim().length === 0) {
      throw new Error('El texto no puede estar vacío');
    }

    const request = {
      input: { text: texto },
      voice: {
        languageCode: 'es-ES',
        name: 'es-ES-Standard-A', // Voz femenina en español
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: opciones.velocidad || 1.0, // Velocidad normal
        pitch: opciones.tono || 0.0, // Tono normal
        volumeGainDb: opciones.volumen || 0.0 // Volumen normal
      }
    };

    console.log(`🎵 Generando audio para texto de ${texto.length} caracteres...`);
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No se pudo generar el contenido de audio');
    }

    console.log(`✅ Audio generado exitosamente (${response.audioContent.length} bytes)`);
    return response.audioContent;
  } catch (error) {
    console.error('❌ Error al generar audio:', error.message);
    throw new Error(`Error al generar audio: ${error.message}`);
  }
}

/**
 * Obtiene las voces disponibles en español
 * @returns {Array} Lista de voces disponibles
 */
export async function obtenerVocesDisponibles() {
  try {
    const [result] = await ttsClient.listVoices({
      languageCode: 'es-ES'
    });
    
    return result.voices || [];
  } catch (error) {
    console.error('Error al obtener voces:', error.message);
    throw new Error(`Error al obtener voces: ${error.message}`);
  }
}

/**
 * Calcula la duración estimada del audio en segundos
 * @param {string} texto - Texto a convertir
 * @param {number} velocidad - Velocidad de habla (default: 1.0)
 * @returns {number} Duración estimada en segundos
 */
export function calcularDuracionEstimada(texto, velocidad = 1.0) {
  // Estimación: ~150 palabras por minuto en velocidad normal
  const palabrasPorMinuto = 150 * velocidad;
  const palabras = texto.split(/\s+/).length;
  const minutos = palabras / palabrasPorMinuto;
  return Math.ceil(minutos * 60); // Convertir a segundos
}



const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function generarAudioElevenLabs(texto, voiceId = 'JBFqnCBsd6RMkjVDRZzb') {
  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text: texto,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  // Convertir el stream a buffer
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}


