// services/logro.eventos.service.js
import { supabaseAdmin } from '../config/supabase.js';
import { desbloquearLogro } from './logro.service.js';


export async function procesarEvento(alumnoId, tipoEvento, valorActual = 1) {
  console.log(`Procesando evento: ${tipoEvento} con valor ${valorActual}`);
  
  try {
    
    const { data: logrosDisponibles, error } = await supabaseAdmin
      .from('logros')
      .select('*')
      .eq('evento', tipoEvento)
      .lte('valor', valorActual);

    if (error) {
      console.error('Error al buscar logros:', error);
      return { logrosDesbloqueados: [] };
    }

    if (!logrosDisponibles || logrosDisponibles.length === 0) {
      console.log('ℹNo hay logros para este evento');
      return { logrosDesbloqueados: [] };
    }

    console.log(`Encontrados ${logrosDisponibles.length} logros potenciales`);

  
    const logrosDesbloqueados = [];

    for (const logro of logrosDisponibles) {
      try {
       const resultado = await desbloquearLogro(alumnoId, logro.id_logros);

        if (!resultado.yaDesbloqueado) {
          console.log(`Logro desbloqueado: ${logro.nombre}`);
          logrosDesbloqueados.push({
            ...logro,
            fecha_desbloqueo: resultado.fecha_desbloqueo
          });
        } else {
          console.log(`ℹLogro ya desbloqueado: ${logro.nombre}`);
        }
      } catch (logroError) {
        console.log(`Error al desbloquear logro ${logro.id_logros}:`, logroError.message);
      }
    }

    return { 
      logrosDesbloqueados,
      mensaje: logrosDesbloqueados.length > 0 
        ? `¡Desbloqueaste ${logrosDesbloqueados.length} logro(s)!`
        : null
    };

  } catch (error) {
    console.error('Error en procesarEvento:', error);
    return { logrosDesbloqueados: [] };
  }
}


export async function obtenerContador(usuarioId, tipoEvento) {
  const { data: alumno } = await supabaseAdmin
    .from('alumno')
    .select('id_alumno')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (!alumno) return 0;

  switch (tipoEvento) {
    case 'puntos':
      
      const { data: puntos } = await supabaseAdmin
        .from('puntos_alumno')
        .select('puntos')
        .eq('alumno_id_alumno', alumno.id_alumno)
        .single();
      return puntos?.puntos || 0;

    case 'compras':
      
      const { count: compras } = await supabaseAdmin
        .from('alumno_has_item') 
        .select('*', { count: 'exact', head: true })
        .eq('alumno_id', alumno.id_alumno);
      return compras || 0;

    default:
      return 1; 
  }
}