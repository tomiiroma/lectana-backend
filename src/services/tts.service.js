// src/services/ttsService.js
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';
dotenv.config();

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function generarAudio(texto, voiceId = 'JBFqnCBsd6RMkjVDRZzb') {
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
