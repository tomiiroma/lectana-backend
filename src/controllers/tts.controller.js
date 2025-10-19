// src/controllers/ttsController.js
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { generarAudio, generarAudioElevenLabs } from '../services/tts.service.js';

const tempDir = path.join(process.cwd(), 'temp_audios');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

export async function generarAudioController(req, res) {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'El campo "text" es obligatorio.' });
    }

    const audioBuffer = await generarAudioElevenLabs(text, voiceId);

    // Enviar como archivo MP3 directamente
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="voz.mp3"');
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Error generando audio:', error);
    res.status(500).json({ error: 'Error generando el audio.' });
  }
}

export async function pdfToAudioController(req, res) {
  try {
    const { pdfUrl, voiceId } = req.body;
    if (!pdfUrl) return res.status(400).json({ error: 'El campo "pdfUrl" es obligatorio.' });

    // 1️⃣ Descargar PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('No se pudo descargar el PDF');
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 2️⃣ Extraer texto
    const pdfData = await pdfParse(pdfBuffer);
    const textoCompleto = pdfData.text;

    if (!textoCompleto || textoCompleto.trim() === '') {
        return res.status(400).json({ error: 'El PDF no contiene texto.' });
    }

    // 3️⃣ Dividir texto en fragmentos
    const palabras = textoCompleto.split(/\s+/);
    const maxPalabras = 1500;
    const fragmentos = [];
    for (let i = 0; i < palabras.length; i += maxPalabras) {
      fragmentos.push(palabras.slice(i, i + maxPalabras).join(' '));
    }

    // 4️⃣ Generar MP3 por cada fragmento y guardar
    const urls = [];
    let contador = 1;
    for (const fragmento of fragmentos) {
      const audioBuffer = await generarAudioElevenLabs(fragmento, voiceId);
      const filename = `voz_${Date.now()}_${contador}.mp3`;
      const filepath = path.join(tempDir, filename);
      fs.writeFileSync(filepath, audioBuffer);
      urls.push(`http://localhost:3000/temp_audios/${filename}`); // URL accesible para Android
      contador++;
    }

    // 5️⃣ Devolver URLs a Android
    res.json({ audios: urls });

  } catch (error) {
    console.error('❌ Error procesando PDF a audio:', error);
    res.status(500).json({ error: 'Error procesando PDF a audio.' });
  }
}
