import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

// Configurar credenciales
let credentials = null;
let projectId = 'lectana-tts';

// Intentar cargar desde variables de entorno primero
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim()) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || credentials.project_id;
    console.log('✅ Credenciales de Google Cloud cargadas desde variables de entorno');
  } catch (error) {
    console.error('❌ Error al parsear credenciales de variables de entorno:', error.message);
    console.log('🔄 Continuando con carga desde archivo...');
  }
}

// Si no hay credenciales en variables de entorno, intentar cargar desde archivo
if (!credentials) {
  try {
    const credentialsPath = path.join(process.cwd(), '..', 'IMPORTANTE CLAVE LECTANA', 'lectana-tts-230958be1064.json');
    if (fs.existsSync(credentialsPath)) {
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      projectId = credentials.project_id;
      console.log('✅ Credenciales de Google Cloud cargadas desde archivo');
    }
  } catch (error) {
    console.error('❌ Error al cargar credenciales desde archivo:', error.message);
  }
}

if (!credentials) {
  throw new Error('❌ No se pudieron cargar las credenciales de Google Cloud');
}

// Crear cliente de Text-to-Speech
export const ttsClient = new TextToSpeechClient({
  projectId: projectId,
  credentials: credentials
});

export default ttsClient;
