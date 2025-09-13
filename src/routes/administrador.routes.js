import { Router } from 'express';
import { 
  crearAdministradorController, 
  obtenerAdministradorController, 
  actualizarAdministradorController, 
  listarAdministradoresController,
  obtenerPerfilAdministradorController,
  actualizarPerfilAdministradorController
} from '../controllers/administrador.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Crear administrador (solo admin)
router.post('/crear-administrador', requireAuth, requireRole('administrador'), crearAdministradorController);

// Perfil propio del administrador (autenticado como administrador)
router.get('/obtener-perfil-administrador', requireAuth, requireRole('administrador'), obtenerPerfilAdministradorController);
router.put('/actualizar-perfil-administrador', requireAuth, requireRole('administrador'), actualizarPerfilAdministradorController);

// Admin: Listar administradores y obtener por ID
router.get('/admin-listar-administradores', requireAuth, requireRole('administrador'), listarAdministradoresController);
router.get('/admin-obtener-administrador/:id', requireAuth, requireRole('administrador'), obtenerAdministradorController);
router.put('/admin-actualizar-administrador/:id', requireAuth, requireRole('administrador'), actualizarAdministradorController);

export default router;
