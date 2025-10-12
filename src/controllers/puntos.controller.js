import {  obtenerPuntos } from "../services/puntos.service.js";

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

        res.status(200).json({ // 200, no 201
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