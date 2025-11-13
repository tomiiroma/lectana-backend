import {  obtenerPuntos, obtenerPuntosPorUsuario } from "../services/puntos.service.js";


// puntos del alumno 

export async function obtenerPuntosController(req, res) {
    try {
        const { puntos } = req.body;
        const id = req.user.sub;

        if (!puntos || typeof puntos !== 'number' || puntos <= 0) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Debe proporcionar una cantidad válida de puntos' 
            });
        }

        const result = await obtenerPuntos(id, puntos);

        res.status(200).json({ 
            ok: true,
            mensaje: "Puntos actualizados exitosamente",
            data: result
        });

    } catch (error) {
        console.error('Error al canjear puntos:', error);
        
        return res.status(400).json({ 
            ok: false, 
            error: error.message || 'Error al procesar los puntos'
        });
    }
}


 // Obtiene los puntos del alumno autenticado usando los datos de la sesión
 
export async function obtenerMisPuntosController(req, res, next) {
  try {
 
    const usuarioId =  req.user.sub;;
    
    if (!usuarioId) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Usuario no autenticado' 
      });
    }

    const puntos = await obtenerPuntosPorUsuario(usuarioId);
    
    if (!puntos) {
      return res.status(404).json({ 
        ok: false, 
        error: 'No se encontraron puntos para este usuario' 
      });
    }

    res.json({ 
      ok: true, 
      puntos 
    });
  } catch (error) {
    if (error.message.includes('Alumno no encontrado')) {
      return res.status(404).json({ 
        ok: false, 
        error: 'El usuario no está registrado como alumno' 
      });
    }
    next(error);
  }
}