import { supabaseAdmin } from '../config/supabase.js';


export async function obtenerPuntosAlumno(id_alumno){
    const { data, error } = await supabaseAdmin
    .from('puntos_alumno')
    .select()
    .eq('alumno_id_alumno', id_alumno)

    if(error){
        throw new Error (error.message)
    }
    return data;
}

export async function obtenerPuntos(id_alumno, puntosASumar) { 
    const { data: alumnoData, error: errorSelect } = await supabaseAdmin
        .from('puntos_alumno')
        .select('puntos')
        .eq('alumno_id_alumno', id_alumno)
        .single();

    if (errorSelect) {
        throw new Error(`Error al obtener puntos: ${errorSelect.message}`);
    }

    if (!alumnoData) {
        throw new Error('Alumno no encontrado');
    }

    const puntosActuales = alumnoData.puntos;
    const nuevosPuntos = puntosActuales + puntosASumar; 

    const { data, error: errorUpdate } = await supabaseAdmin
        .from('puntos_alumno')
        .update({ puntos: nuevosPuntos })
        .eq('alumno_id_alumno', id_alumno)
        .select()
        .single();

    if (errorUpdate) {
        throw new Error(`Error al actualizar puntos: ${errorUpdate.message}`);
    }

    return data;
}