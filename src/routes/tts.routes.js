import { Router } from 'express';
import { generarAudioController } from '../controllers/tts.controller.js';
const router = Router();

router.post('/getAudio', generarAudioController)

export default router;