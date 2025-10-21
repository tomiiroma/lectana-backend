// src/controllers/ttsController.js
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { generarAudio, generarAudioElevenLabs } from '../services/tts.service.js';
import { subirAudio } from '../services/archivo.service.js';

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
    const { pdfUrl, voiceId, cuentoId } = req.body;

    if (!pdfUrl) return res.status(400).json({ error: 'El campo "pdfUrl" es obligatorio.' });
    if (!cuentoId) return res.status(400).json({ error: 'El campo "cuentoId" es obligatorio.' });

    // 1️⃣ Descargar PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('No se pudo descargar el PDF');
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 2️⃣ Extraer texto del PDF
    const pdfData = await pdfParse(pdfBuffer);
    const textoCompleto = pdfData.text;

    // 3️⃣ Dividir texto en fragmentos de 1500 palabras
    const palabras = textoCompleto.split(/\s+/);
    const maxPalabras = 1500;
    const fragmentos = [];
    for (let i = 0; i < palabras.length; i += maxPalabras) {
      fragmentos.push(palabras.slice(i, i + maxPalabras).join(' '));
    }

    // 4️⃣ Generar audios para cada fragmento y concatenarlos
    const buffers = [];
    for (const fragmento of fragmentos) {
      const audioBuffer = await generarAudioElevenLabs(fragmento, voiceId);
      buffers.push(audioBuffer);
    }

    // 5️⃣ Combinar todos los buffers en uno solo
    const audioFinal = Buffer.concat(buffers);

    // 6️⃣ Subir el audio final a Supabase
    const nombreArchivo = `cuento_${cuentoId}_completo_${Date.now()}.mp3`;
    const subida = await subirAudio(cuentoId, audioFinal, nombreArchivo);

    // 7️⃣ Responder al cliente con la URL final
    res.json({
      message: '✅ Audio completo generado y subido correctamente',
      audioUrl: subida.url,
    });

  } catch (error) {
    console.error('❌ Error procesando PDF a audio:', error);
    res.status(500).json({ error: 'Error procesando PDF a audio.' });
  }
}
