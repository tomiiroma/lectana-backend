import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import healthRouter from './routes/health.routes.js';
import testRouter from './routes/test.routes.js';
import usuarioRouter from './routes/usuario.routes.js';
import docenteRouter from './routes/docente.routes.js';
import administradorRouter from './routes/administrador.routes.js';
import authRouter from './routes/auth.routes.js';
import alumnoRouter from './routes/alumno.routes.js';
import autorRouter from './routes/autor.routes.js';
import generoRouter from './routes/genero.routes.js';
import cuentoRouter from './routes/cuento.routes.js';
import imagenRouter from './routes/imagen.routes.js';
import archivoRouter from './routes/archivo.routes.js';
import aulaRouter from './routes/aula.routes.js';
import actividadRouter from './routes/actividad.routes.js';
import preguntaActividadRouter from './routes/pregunta_actividad.routes.js';
import respuestaActividadRouter from './routes/respuesta_actividad.routes.js';
import respuestaUsuarioRouter from './routes/respuesta_usuario.routes.js';
import puntosRoutes from './routes/puntos.routes.js';
import audioRouter from './routes/audio.routes.js';



const app = express();

// Configurar trust proxy para Render
app.set('trust proxy', 1);

app.use(cookieParser())
// Middlewares
const rawOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: rawOrigins.length ? rawOrigins : (process.env.NODE_ENV !== 'production' ? true : false),
  credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' })); // Límite de tamaño para evitar memory leaks
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Timeout middleware para evitar conexiones colgadas (ajustable por entorno)
app.use((req, res, next) => {
  const timeout = process.env.NODE_ENV === 'production' ? 30000 : 60000;
  req.setTimeout(timeout);
  res.setTimeout(timeout);
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Logging condicional más eficiente (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
      const duration = Date.now() - start;
      if (duration > 100) {
        console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      }
      originalSend.call(this, data);
    };
    
    next();
  });
}

// Rate limiter configurable por entorno
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  // Configurar keyGenerator para usar IP real detrás del proxy
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skip: (req) => {
    // Saltar rate limiting en desarrollo para localhost
    return process.env.NODE_ENV !== 'production' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  },
  message: {
    ok: false,
    error: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.'
  }
});

// Exponer limiter para uso en routers si se requiere
app.set('authLimiter', authLimiter);

// Rutas
app.use('/health', healthRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/test', testRouter);
}
app.use('/api/usuarios', usuarioRouter);
app.use('/api/docentes', docenteRouter);
app.use('/api/administrador', administradorRouter);
app.use('/api/auth', authRouter);
app.use('/api/alumnos', alumnoRouter);
app.use('/api/autores', autorRouter);
app.use('/api/generos', generoRouter);
app.use('/api/cuentos', cuentoRouter);
app.use('/api/imagenes', imagenRouter);
app.use('/api', archivoRouter);
app.use('/api/aulas', aulaRouter);
app.use('/api/actividades', actividadRouter);
app.use('/api/preguntas', preguntaActividadRouter);
app.use('/api/respuestas', respuestaActividadRouter);
app.use('/api/respuestas-usuario', respuestaUsuarioRouter);
app.use('/api/puntos', puntosRoutes);
app.use('/api/audio', audioRouter);




// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// Manejador de errores mejorado
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Si es un error de rate limiting
  if (err.status === 429) {
    return res.status(429).json({ 
      ok: false, 
      error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' 
    });
  }
  
  // Si es un error de timeout
  if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    return res.status(408).json({ 
      ok: false, 
      error: 'Timeout de la solicitud. Intenta de nuevo.' 
    });
  }
  
  // Error genérico
  res.status(500).json({ 
    ok: false, 
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;
