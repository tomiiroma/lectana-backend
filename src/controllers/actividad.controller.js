import { z } from 'zod';
import { 
  crearActividadConCuento, 
  crearActividadCompleta,
  obtenerTodasLasActividadesConAulas,
  obtenerActividadPorIdConAulas, 
  actualizarActividadCompleta,
  actualizarActividadCompletaConPreguntas, 
  eliminarActividad,
  asignarActividadAAulas,
  obtenerAulasDeActividad,
  removerActividadDeAula,
  obtenerActividadesDeAula,
  crearActividad,
  getActividadPorAula,
  getActividadCompleta,
  corregirActividad
} from '../services/actividad.service.js';
import { idSchema } from '../schemas/idSchema.js';
import { asignarAulasSchema , actualizarActividadCompletaSchema ,crearActividadCompletaSchema, actualizarActividadCompletaConPreguntasSchema, crearActividadConCuentoSchema } from '../schemas/actividadSchema,.js';


// 1. Crear actividad con cuento (cuento requerido desde el inicio)
export async function crearActividadConCuentoController(req, res, next) {
  try {
    const payload = crearActividadConCuentoSchema.parse(req.body);
    const actividad = await crearActividadConCuento(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Actividad creada exitosamente con cuento',
      actividad 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 1.1. Crear actividad completa con preguntas y respuestas
export async function crearActividadCompletaController(req, res, next) {
  try {
    const payload = crearActividadCompletaSchema.parse(req.body);
    const actividad = await crearActividadCompleta(payload);
    res.status(201).json({ 
      ok: true, 
      mensaje: 'Actividad completa creada exitosamente con preguntas y respuestas',
      actividad 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 2. Asignar docente a una actividad - ELIMINADO
// Ya no es necesario porque el docente se obtiene a través del aula

// 3. Obtener todas las actividades (con aulas)
export async function obtenerTodasLasActividadesController(req, res, next) {
  try {
    const actividades = await obtenerTodasLasActividadesConAulas();
    res.json({ 
      ok: true, 
      actividades,
      total: actividades.length 
    });
  } catch (error) {
    next(error);
  }
}

// 4. Obtener actividad por ID (con aulas)
export async function obtenerActividadPorIdController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const actividad = await obtenerActividadPorIdConAulas(id);
    res.json({ ok: true, actividad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 5. Actualizar actividad completa
export async function actualizarActividadCompletaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadCompletaSchema.parse(req.body);
    const actividad = await actualizarActividadCompleta(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad actualizada exitosamente',
      actividad 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 5.1. Actualizar actividad completa con preguntas y respuestas
export async function actualizarActividadCompletaConPreguntasController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarActividadCompletaConPreguntasSchema.parse(req.body);
    const actividad = await actualizarActividadCompletaConPreguntas(id, updates);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad completa actualizada exitosamente con preguntas y respuestas',
      actividad 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    if (error.message.includes('No rows')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Actividad no encontrada' 
      });
    }
    next(error);
  }
}

// 6. Eliminar actividad
export async function eliminarActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    await eliminarActividad(id);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad eliminada (soft delete)' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// ===== CONTROLADORES PARA GESTIÓN DE AULAS =====



// 7. Asignar actividad a múltiples aulas
export async function asignarActividadAAulasController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const { aulas } = asignarAulasSchema.parse(req.body);
    
    const asignaciones = await asignarActividadAAulas(id, aulas);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad asignada a aulas exitosamente',
      asignaciones,
      total_aulas: asignaciones.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 8. Obtener aulas asignadas a una actividad
export async function obtenerAulasDeActividadController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const aulas = await obtenerAulasDeActividad(id);
    res.json({ 
      ok: true, 
      aulas,
      total: aulas.length 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 9. Remover actividad de un aula específica
export async function removerActividadDeAulaController(req, res, next) {
  try {
    const { id, aulaId } = z.object({ 
      id: z.coerce.number().int().positive(),
      aulaId: z.coerce.number().int().positive()
    }).parse(req.params);
    
    await removerActividadDeAula(id, aulaId);
    res.json({ 
      ok: true, 
      mensaje: 'Actividad removida del aula exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

// 10. Obtener actividades de un aula específica (para usar en rutas de aula)
export async function obtenerActividadesDeAulaController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const actividades = await obtenerActividadesDeAula(id);
    res.json({ 
      ok: true, 
      actividades,
      total: actividades.length 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Parámetros inválidos', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

  export async function crearActividadController(req, res){
    try{
      const {fecha_entrega,tipo, descripcion,id_cuento, aulas_ids} = req.body;
      const id_usuario = req.user.sub;
      const actividad = await crearActividad(fecha_entrega,tipo, descripcion , id_cuento , id_usuario);

      let asignaciones = [];
      if (Array.isArray(aulas_ids) && aulas_ids.length > 0) {
        asignaciones = await asignarActividadAAulas(actividad.id_actividad, aulas_ids);
      }

      res.status(201).json({actividad, asignaciones});
    }catch(error){
      console.log("Error: ", error.message);
    }
  }


  export async function getActividadPorAulaController(req, res){
    try{
  const {id_aula} = req.params

      const actividades = await getActividadPorAula(id_aula)

      res.status(200).json({actividades})
    }catch(error){
            console.log("Error: ", error.message);

    }
  
  }

export async function getActividadCompletaController(req, res){
  
  try{
  const { idActividad }  = req.params;
    console.log('id_actividad recibido:', idActividad); // ← Agregar esto

      if(!idActividad){
      return res.status(400).json({ ok: false, error: 'id_actividad es requerido' })
    }

    const actividadCompleta = await getActividadCompleta(idActividad)
    res.status(200).json({actividadCompleta})

  }catch(error){
      console.log("Error: ", error.message);
  }
}

export async function corregirActividadController(req,res){
  try{
      const {id_pregunta, respuestaUsuario} = req.body
   console.log('id_pregunta recibido:', id_pregunta); 
      console.log('respuestaUsuario recibido:', respuestaUsuario);

   if(!id_pregunta){
      return res.status(400).json({ ok: false, error: 'id_pregunta es requerido' })
    }

    const corregirActividadRes = await corregirActividad(id_pregunta, respuestaUsuario)

        if(!corregirActividadRes || corregirActividadRes.respuesta_correcta === undefined){
          return res.status(404).json({ ok: false, error: 'No se encontró la pregunta o respuesta correcta' })
      }

      const esCorrecta = Number(respuestaUsuario) === Number(corregirActividadRes.respuesta_correcta)

      return res.status(200).json({ 
          ok: true,
          esCorrecta: esCorrecta,
          mensaje: esCorrecta ? "Respuesta Correcta" : "Respuesta Incorrecta",
          respuestaCorrecta: corregirActividadRes.respuesta_correcta,
          respuestaUsuario: respuestaUsuario
      })

  }catch(error){
      console.log("Error: ", error.message);
   res.status(500).json({ ok: false, error: error.message })
  }
}