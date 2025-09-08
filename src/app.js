import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.routes.js';
import testRouter from './routes/test.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (process.env.CORS_ORIGINS || '').split(','),
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/health', healthRouter);
app.use('/test', testRouter);




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
