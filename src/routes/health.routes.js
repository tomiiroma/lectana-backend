import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Contador de requests para monitoreo
let requestCount = 0;
let errorCount = 0;

router.get('/', async (req, res) => {
  const startTime = Date.now();
  requestCount++;
  
  try {
    // Verificar conexión a la base de datos con timeout
    const dbPromise = supabaseAdmin
      .from('usuario')
      .select('count')
      .limit(1);
    
    // Timeout de 5 segundos para la consulta de DB
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );
    
    const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

    if (error) {
      errorCount++;
      return res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        stats: {
          totalRequests: requestCount,
          totalErrors: errorCount,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
      });
    }

    const responseTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      stats: {
        totalRequests: requestCount,
        totalErrors: errorCount,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    errorCount++;
    const responseTime = Date.now() - startTime;
    
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      responseTime: `${responseTime}ms`,
      stats: {
        totalRequests: requestCount,
        totalErrors: errorCount,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  }
});

// Endpoint para resetear contadores (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset', (req, res) => {
    requestCount = 0;
    errorCount = 0;
    res.json({ message: 'Contadores reseteados' });
  });
}

export default router;
