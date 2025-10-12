import { Router } from 'express';
import {  obtenerPuntosController } from '../controllers/puntos.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
const router = Router();


router.post('/canjear',requireAuth, obtenerPuntosController);


export default router;