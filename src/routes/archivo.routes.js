import { Router } from 'express';
import multer from 'multer';
import { 
  subirPDFController, 
  obtenerURLPDFController, 
  eliminarPDFController, 
  listarArchivosController 
} from '../controllers/archivo.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Configurar multer para manejo de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

// Aplicar rate limiting
router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

// Rutas públicas para obtener URLs de PDFs
router.get('/cuento/:id/url', obtenerURLPDFController);

// Rutas protegidas para administradores
router.post('/cuento/:id/subir', requireAuth, requireRole('administrador'), upload.single('pdf'), subirPDFController);
router.delete('/cuento/:id/eliminar', requireAuth, requireRole('administrador'), eliminarPDFController);
router.get('/listar', requireAuth, requireRole('administrador'), listarArchivosController);

export default router;
