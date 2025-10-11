import { activarUsuario, AgregarLibroAfavoritos, crearUsuario, desactivarUsuario } from '../services/usuario.service.js';
import { obtenerUsuarioPorId, actualizarUsuario } from '../services/usuario.service.js';
import { z } from 'zod';


import { crearUsuarioSchema, obtenerUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuarioSchema.js';


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

export async function agregarLibroFavoritos(req,res){
  try{
    const  id_usuario  = req.user.sub;
    const { id_libro } = req.body;


    if(!id_libro){
      return res.status(400).json({
        ok: false,
        error: "El libro escogido es invalido"
      })
    }

    const favLibro = await AgregarLibroAfavoritos(id_usuario, id_libro)

    return favLibro;
  }catch(error){
    return res.status(500).json({
      ok: false,
      error: error.message
    })
  }
   
}
