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
import actividadDocenteRouter from './routes/actividad-docente.routes.js';
import logroRouter from './routes/logro.routes.js';
import elevenLabs from './routes/tts.routes.js'


const app = express();

// Configurar trust proxy para Render
app.set('trust proxy', 1);

app.use(cookieParser())
// Configuración CORS flexible para local y producción
const allowedOrigins = [
  'https://lectana.vercel.app',
  'https://www.lectana.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173'
];

// Agregar orígenes adicionales desde variables de entorno
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

allowedOrigins.push(...envOrigins);

// Configuración CORS principal
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir cualquier localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir cualquier 127.0.0.1
    if (process.env.NODE_ENV !== 'production' && origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    console.log('🚫 CORS bloqueado para origin:', origin);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
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

// Endpoint de prueba CORS mejorado
app.get('/cors-test', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'CORS funcionando correctamente',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins: allowedOrigins,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
});

// Endpoint OPTIONS para preflight
app.options('/cors-test', (req, res) => {
  res.status(200).end();
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/test', testRouter);
}
// Rutas con prefijo /api/
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
app.use('/api/docentes/actividades', actividadDocenteRouter);
app.use('/api/logros', logroRouter);

// Rutas SIN prefijo /api/ para compatibilidad con frontend
app.use('/auth', authRouter);
app.use('/usuarios', usuarioRouter);
app.use('/docentes', docenteRouter);
app.use('/administrador', administradorRouter);
app.use('/alumnos', alumnoRouter);
app.use('/autores', autorRouter);
app.use('/generos', generoRouter);
app.use('/cuentos', cuentoRouter);
app.use('/imagenes', imagenRouter);
app.use('/aulas', aulaRouter);
app.use('/actividades', actividadRouter);
app.use('/preguntas', preguntaActividadRouter);
app.use('/respuestas', respuestaActividadRouter);
app.use('/respuestas-usuario', respuestaUsuarioRouter);
app.use('/puntos', puntosRoutes);
app.use('/audio', audioRouter);
app.use('/audioElevenLabs', elevenLabs);
app.use('/logros', logroRouter);

app.use('/docentes/actividades', actividadDocenteRouter);




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
