import { z } from 'zod';
import { login, registerAlumno, registerDocente, registerAdministrador, getMe } from '../services/auth.service.js';
import cookieParser from 'cookie-parser';
import { loginSchema,registerAlumnoSchema,registerDocenteSchema,registerAdministradorSchema } from '../schemas/authSchema.js';

export async function loginController(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login({ email, password });

    const token = result.token

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // ← AGREGAR ESTO
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
    if (String(error.message).toLowerCase().includes('constraint')) {
      return res.status(400).json({ ok: false, error: 'Error en los datos enviados: ' + error.message });
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
