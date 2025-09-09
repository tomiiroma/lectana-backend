import { Router } from 'express';
import { 
  crearItemController,
  crearItemConImagenController,
  obtenerItemController, 
  listarItemsController,
  listarItemsPorCategoriaController,
  listarItemsPorTipoController,
  actualizarItemController, 
  eliminarItemController,
  desbloquearItemController,
  obtenerItemsDesbloqueadosController,
  verificarItemDesbloqueadoController,
  obtenerEstadisticasItemsController
} from '../controllers/item.controller.js';
import { upload } from '../services/imagen.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas
router.get('/', listarItemsController);
router.get('/categoria/:categoria', listarItemsPorCategoriaController);
router.get('/tipo/:tipo', listarItemsPorTipoController);
router.get('/estadisticas', obtenerEstadisticasItemsController);
router.get('/:id', obtenerItemController);

// Rutas para estudiantes
router.post('/:id/desbloquear', requireAuth, requireRole('alumno'), desbloquearItemController);
router.get('/mis-items/desbloqueados', requireAuth, requireRole('alumno'), obtenerItemsDesbloqueadosController);
router.get('/:id/verificar-desbloqueo', requireAuth, requireRole('alumno'), verificarItemDesbloqueadoController);

// Rutas solo para administradores
router.post('/', requireAuth, requireRole('administrador'), crearItemController);
router.post('/con-imagen', 
  requireAuth, 
  requireRole('administrador'), 
  upload.single('imagen'), 
  crearItemConImagenController
);
router.put('/:id', requireAuth, requireRole('administrador'), actualizarItemController);
router.delete('/:id', requireAuth, requireRole('administrador'), eliminarItemController);

export default router;
