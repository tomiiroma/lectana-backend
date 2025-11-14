import { Router } from 'express';
import {  obtenerPuntosController,
    obtenerMisPuntosController 
} from '../controllers/puntos.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/mis-puntos', requireAuth, requireRole('alumno'), obtenerMisPuntosController);

router.post('/canjear',requireAuth, obtenerPuntosController);




export default router;