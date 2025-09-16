import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

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



const app = express();

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
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter básico (por IP) para endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
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
app.use('/api/administradores', administradorRouter);
app.use('/api/auth', authRouter);
app.use('/api/alumnos', alumnoRouter);
app.use('/api/autores', autorRouter);
app.use('/api/generos', generoRouter);
app.use('/api/cuentos', cuentoRouter);
app.use('/api/imagenes', imagenRouter);
app.use('/api', archivoRouter);
app.use('/api/aulas', aulaRouter);




// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ ok: false, error: err.message || 'Internal Server Error' });
});

export default app;
