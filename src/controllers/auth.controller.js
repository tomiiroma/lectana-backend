import { z } from 'zod';
import { login, registerAlumno, registerDocente, registerAdministrador, getMe } from '../services/auth.service.js';
import cookieParser from 'cookie-parser';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerAlumnoSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(5).max(120),
  password: z.string().min(8),
  codigo_acceso: z.string().optional(),
});

const registerDocenteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(18).max(120),
  password: z.string().min(8),
  dni: z.string().min(7).max(15),
  telefono: z.string().optional(),
  institucion_nombre: z.string().min(2),
  institucion_pais: z.string().min(2),
  institucion_provincia: z.string().min(2),
  nivel_educativo: z.enum(['primaria', 'secundaria', 'ambos']),
});

const registerAdministradorSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email(),
  edad: z.number().int().min(18).max(120),
  password: z.string().min(8),
  dni: z.string().min(7).max(15),
  telefono: z.string().optional(),
});

export async function loginController(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login({ email, password });

    const token = result.token

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
    })
    
    res.json({
      ok: true,
      ...result,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('credenciales')) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    next(error);
  }
}

export async function logoutController(req, res){
  res
  .clearCookie('token')
  .json({message : "Logout Exitoso"}) //Se puede redirigir a una ruta sino
}

export async function registerAlumnoController(req, res, next) {
  try {
    const data = registerAlumnoSchema.parse(req.body);
    const result = await registerAlumno(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email')) {
      return res.status(409).json({ ok: false, error: 'Email ya registrado' });
    }
    next(error);
  }
}

export async function registerDocenteController(req, res, next) {
  try {
    const data = registerDocenteSchema.parse(req.body);
    const result = await registerDocente(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email')) {
      return res.status(409).json({ ok: false, error: 'Email ya registrado' });
    }
    next(error);
  }
}

export async function registerAdministradorController(req, res, next) {
  try {
    const data = registerAdministradorSchema.parse(req.body);
    const result = await registerAdministrador(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email')) {
      return res.status(409).json({ ok: false, error: 'Email ya registrado' });
    }
    next(error);
  }
}

export async function getMeController(req, res, next) {
  try {
    const result = await getMe(req.user);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
}
