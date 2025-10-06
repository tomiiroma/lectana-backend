import { activarUsuario, crearUsuario, desactivarUsuario } from '../services/usuario.service.js';
import { obtenerUsuarioPorId, actualizarUsuario } from '../services/usuario.service.js';
import { z } from 'zod';

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, 'nombre requerido'),
  apellido: z.string().min(1, 'apellido requerido'),
  email: z.string().email('email inválido'),
  edad: z.number().int().min(5).max(120),
  password: z.string().min(8, 'password mínimo 8 caracteres'),
});

export async function crearUsuarioController(req, res, next) {
  try {
    const { nombre, apellido, email, edad, password } = crearUsuarioSchema.parse(req.body);

    const nuevoUsuario = await crearUsuario({
      nombre,
      apellido,
      email,
      edad,
      password,
    });

    res.status(201).json({ ok: true, usuario: nuevoUsuario });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

const obtenerUsuarioSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function desactivarUsuarioController(req,res){
  try{
  const { id } = req.params

  const actualizarUsuario = await desactivarUsuario(id)

    res.status(201).json({ ok: true, message: "Usuario desactivado correctamente" });
  }catch(error){
 if (error) {
      return res.status(400).json({ ok: false, error: error.message});
    }
    next(error);
  }

}

export async function activarUsuarioController(req,res){
  try{
  const { id } = req.params

  const actualizarUsuario = await activarUsuario(id)

    res.status(201).json({ ok: true, message: "Usuario activado correctamente" });
  }catch(error){
 if (error) {
      return res.status(400).json({ ok: false, error: error.message});
    }
    next(error);
  }

}

export async function obtenerUsuarioController(req, res, next) {
  try {
    const { id } = obtenerUsuarioSchema.parse(req.params);
    const usuario = await obtenerUsuarioPorId(id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ ok: true, usuario });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  email: z.string().email().optional(),
  edad: z.number().int().min(5).max(120).optional(),
  password: z.string().min(8).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });

export async function actualizarUsuarioController(req, res, next) {
  try {
    const { id } = obtenerUsuarioSchema.parse(req.params);
    const updates = actualizarUsuarioSchema.parse(req.body);
    const usuarioActualizado = await actualizarUsuario(id, updates);
    res.json({ ok: true, usuario: usuarioActualizado });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}
