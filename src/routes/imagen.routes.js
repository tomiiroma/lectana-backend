import { Router } from 'express';
import multer from 'multer';
import { 
  subirImagenController, 
  obtenerURLImagenController, 
  eliminarImagenController, 
  listarImagenesController 
} from '../controllers/imagen.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Configurar multer para manejo de imágenes en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para imágenes
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP)'), false);
    }
  }
});

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas para obtener URLs de imágenes
router.get('/cuento/:id/url', obtenerURLImagenController);

// Rutas protegidas para administradores
router.post('/cuento/:id/subir', requireAuth, requireRole('administrador'), upload.single('imagen'), subirImagenController);
router.delete('/cuento/:id/eliminar', requireAuth, requireRole('administrador'), eliminarImagenController);
router.get('/listar', requireAuth, requireRole('administrador'), listarImagenesController);

export default router;
