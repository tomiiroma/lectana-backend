import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

// Cache simple en memoria para tokens verificados
const tokenCache = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (now - value.timestamp > CACHE_TIMEOUT) {
      tokenCache.delete(key);
    }
  }
};

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Token de acceso requerido' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({ ok: false, error: 'JWT_SECRET no configurado' });
    }

    // Limpiar entradas expiradas
    cleanExpiredCache();

    // Revisar cache primero
    if (tokenCache.has(token)) {
      const cached = tokenCache.get(token);
      if (Date.now() - cached.timestamp < CACHE_TIMEOUT) {
        req.user = cached.decoded;
        return next();
      } else {
        tokenCache.delete(token);
      }
    }

    // Verificar JWT y cachear resultado
    const decoded = jwt.verify(token, jwtSecret);
    tokenCache.set(token, { decoded, timestamp: Date.now() });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ ok: false, error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'Token expirado' });
    }
    return res.status(401).json({ ok: false, error: 'Token de acceso inválido' });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Autenticación requerida' });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Acceso denegado', 
        required: roles,
        current: userRole 
      });
    }

    // Verificación adicional para docentes
    if (userRole === 'docente' && !req.user.verificado) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Cuenta de docente no verificada' 
      });
    }

    next();
  };
}

export function requireVerifiedDocente(req, res, next) {
  if (!req.user || req.user.role !== 'docente') {
    return res.status(403).json({ ok: false, error: 'Acceso solo para docentes' });
  }
  
  if (!req.user.verificado) {
    return res.status(403).json({ ok: false, error: 'Cuenta de docente no verificada' });
  }
  
  next();
}
