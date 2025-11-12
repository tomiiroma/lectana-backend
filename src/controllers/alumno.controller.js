import { z } from 'zod';
import { crearAlumno, listarAlumnos, obtenerPerfilAlumno, actualizarPerfilAlumno, obtenerAlumnoPorId, adminActualizarAlumno, responderPregunta, obtenerAulasAlumno, unirseAula, salirAula, cambiarAula } from '../services/alumno.service.js';
import { crearAlumnoSchema, listarSchema, actualizarPerfilSchema,adminActualizarAlumnoSchema } from '../schemas/alumnoSchema.js';
import { idSchema } from "../schemas/idSchema.js";

export async function crearAlumnoController(req, res, next) {
  try {
    const data = crearAlumnoSchema.parse(req.body);
    const result = await crearAlumno(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email') && 
        String(error.message).toLowerCase().includes('ya existe')) {
      return res.status(409).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes('límite')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}


export async function listarAlumnosController(req, res, next) {
  try {
    const params = listarSchema.parse(req.query);
    const result = await listarAlumnos(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}


export async function obtenerPerfilAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilAlumno(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function actualizarPerfilAlumnoController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilAlumno(usuarioId, updates);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerAlumnoPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerAlumnoPorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function adminActualizarAlumnoController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = adminActualizarAlumnoSchema.parse(req.body);
    const result = await adminActualizarAlumno(id, updates);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function responderPreguntaController(req, res){

  try{
  const {respuesta} = req.body;
  const {id_pregunta} = req.params;
  const id_usuario = req.user.sub;



  const respuestaPregunta = await responderPregunta(respuesta, id_pregunta, id_usuario);

    res.status(200).json({respuestaPregunta})
  }catch(error){
    console.log("Error", error.message)
    throw new Error(error.message)
  }

}

export async function obtenerAulasAlumnoController(req,res){
  try{
    const id_usuario = req.user.sub

    const aulasAlumno = await obtenerAulasAlumno(id_usuario)

    res.status(200).json({aulasAlumno});
  }catch(error){
    console.log("Error", error.message)
    throw new Error(error.message)
  }
}

// Controlador para unirse a un aula usando código de acceso
export async function unirseAulaController(req, res, next) {
  try {
    const usuarioId = req.user.sub; // Del JWT
    const { codigo_acceso } = req.body;
    
    if (!codigo_acceso) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El código de acceso es requerido' 
      });
    }
    
    const result = await unirseAula(usuarioId, codigo_acceso);
    res.json({ ok: true, data: result });
  } catch (error) {
    const errorMsg = String(error.message).toLowerCase();
    if (errorMsg.includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (errorMsg.includes('límite') || errorMsg.includes('llena')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

// Controlador para salir de un aula
export async function salirAulaController(req, res, next) {
  try {
    const usuarioId = req.user.sub; // Del JWT
    
    const result = await salirAula(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    const errorMsg = String(error.message).toLowerCase();
    if (errorMsg.includes('no encontrado') || errorMsg.includes('no estás asignado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function cambiarAulaController(req,res){
    try{
      const alumnoId = req.user.sub;
      const aulaId = req.body.aulaId;
      console.log(alumnoId, aulaId)
      const cambioAula = await cambiarAula(alumnoId, aulaId)

      res.status(200).json({cambioAula})
    }catch(error){
    console.log("Error", error.message)
    throw new Error(error.message)
    }
}