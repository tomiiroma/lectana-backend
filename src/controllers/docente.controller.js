import { z } from 'zod';
import { crearDocente, listarDocentes, obtenerPerfilDocente, actualizarPerfilDocente, obtenerDocentePorId, adminActualizarDocente } from '../services/docente.service.js';
import { crearDocenteSchema, listarSchema, idSchema, actualizarPerfilSchema, adminActualizarDocenteSchema } from '../schemas/docenteSchema.js';


export async function crearDocenteController(req, res, next) {
  try {
    const data = crearDocenteSchema.parse(req.body);
    const result = await crearDocente(data);
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('email') && 
        String(error.message).toLowerCase().includes('ya existe')) {
      return res.status(409).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function listarDocentesController(req, res, next) {
  try {
    const raw = listarSchema.parse(req.query);
    const params = {
      page: raw.page,
      limit: raw.limit,
      q: raw.q,
      verificado: typeof raw.verificado !== 'undefined' ? raw.verificado === 'true' : undefined,
      activo: typeof raw.activo !== 'undefined' ? raw.activo === 'true' : undefined
    };
    const result = await listarDocentes(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos', detalles: error.flatten() });
    }
    next(error);
  }
}


export async function obtenerPerfilDocenteController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilDocente(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}



export async function actualizarPerfilDocenteController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilDocente(usuarioId, updates);
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

export async function obtenerDocentePorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerDocentePorId(id);
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



export async function adminActualizarDocenteController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = adminActualizarDocenteSchema.parse(req.body);
    const result = await adminActualizarDocente(id, updates);
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

  export async function completarActividadController(req, res){

    try{
 const {idActividad} = req.params
    const {id_alumno, total,total_correctas, total_incorrectas,sin_corregir, estado, nota } = req.body;

    const resultado_actividad = await completarActividad(idActividad,id_alumno, total,total_correctas, total_incorrectas,sin_corregir, estado, nota )
    res.status(200).json({resultado_actividad});

  }catch(error){
      console.log("Error", error.message)
      throw new Error(error.message)
    }
   


  }