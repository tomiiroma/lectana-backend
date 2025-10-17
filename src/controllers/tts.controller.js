// src/controllers/ttsController.js
import { generarAudio } from '../services/tts.service.js';

export async function generarAudioController(req, res) {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'El campo "text" es obligatorio.' });
    }

    const audioBuffer = await generarAudio(text, voiceId);

    // Enviar como archivo MP3 directamente
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="voz.mp3"');
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Error generando audio:', error);
    res.status(500).json({ error: 'Error generando el audio.' });
  }
}
