import { Router } from 'express';
import { 
  crearCuentoController, 
  listarCuentosController, 
  obtenerCuentoController, 
  actualizarCuentoController, 
  estadisticasCuentosController,
  listarCuentosPublicosController,
  obtenerCuentoPublicoController
} from '../controllers/cuento.controller.js';
import { subirPDFController } from '../controllers/archivo.controller.js';
import { subirImagenCuentoController } from '../controllers/imagen.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rutas públicas (sin autenticación)
router.get('/publicos', listarCuentosPublicosController);
router.get('/publicos/:id', obtenerCuentoPublicoController);
router.get('/publicos/estadisticas/total', estadisticasCuentosController);

// Middleware de rate limiting para rutas protegidas
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas protegidas (requieren autenticación de administrador)
router.post('/', requireAuth, requireRole('administrador'), crearCuentoController);
router.get('/', requireAuth, requireRole('administrador'), listarCuentosController);
router.get('/estadisticas/total', requireAuth, requireRole('administrador'), estadisticasCuentosController);
router.get('/:id', requireAuth, requireRole('administrador'), obtenerCuentoController);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarCuentoController);

// Ruta para subir PDF (que el frontend está esperando)
router.post('/:id/pdf', requireAuth, requireRole('administrador'), upload.single('pdf'), subirPDFController);

// Ruta para subir imagen (que el frontend está esperando)
router.post('/:id/imagen', requireAuth, requireRole('administrador'), upload.single('imagen'), subirImagenCuentoController);

// Ruta de debug para verificar datos del cuento
router.get('/:id/debug', requireAuth, requireRole('administrador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: cuento, error } = await supabaseAdmin
      .from('cuento')
      .select('*')
      .eq('id_cuento', id)
      .single();
    
    if (error) {
      return res.status(404).json({ ok: false, error: 'Cuento no encontrado' });
    }
    
    res.json({ ok: true, data: cuento });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;


