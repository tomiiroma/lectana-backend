    import { Router } from 'express';
    import { generarAudioController, pdfToAudioController } from '../controllers/tts.controller.js';
    const router = Router();

    router.post('/getAudio', generarAudioController)
    router.post('/pdf-to-audio', pdfToAudioController)

    export default router;