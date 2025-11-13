import { Router } from 'express';
import {  obtenerPuntosController,
    obtenerMisPuntosController 
} from '../controllers/puntos.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/mis-puntos', requireAuth, obtenerMisPuntosController);

router.post('/canjear',requireAuth, obtenerPuntosController);




export default router;