// services/logro.eventos.service.js
import { supabaseAdmin } from '../config/supabase.js';

async function obtenerIdAlumnoPorUsuario(usuarioId) {
  const { data: alumno, error } = await supabaseAdmin
    .from('alumno')
    .select('id_alumno')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error || !alumno) {
    throw new Error('Alumno no encontrado');
  }

  return alumno.id_alumno;
}


export async function procesarEvento(usuarioId, tipoEvento, valorActual = 1) {
  console.log(`Procesando evento: ${tipoEvento} con valor ${valorActual}`);
  
  try {
    
    const alumnoId = await obtenerIdAlumnoPorUsuario(usuarioId);
    console.log(`Usuario ID: ${usuarioId} → Alumno ID: ${alumnoId}`);

    
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
        // Verificar si ya está desbloqueado
        const { data: logroExistente } = await supabaseAdmin
          .from('alumno_has_logros')
          .select('*')
          .eq('alumno_id_alumno', alumnoId)
          .eq('logros_id_logros', logro.id_logros)
          .single();

        if (logroExistente) {
          console.log(`ℹLogro ya desbloqueado: ${logro.nombre}`);
          continue;
        }

        
        const { data: nuevoLogro, error: insertError } = await supabaseAdmin
          .from('alumno_has_logros')
          .insert({
            alumno_id_alumno: alumnoId,
            logros_id_logros: logro.id_logros,
            fecha_desbloqueo: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (insertError) {
          console.error(`Error al desbloquear logro ${logro.id_logros}:`, insertError);
          continue;
        }

        console.log(`Logro desbloqueado: ${logro.nombre}`);
        logrosDesbloqueados.push({
          ...logro,
          fecha_desbloqueo: nuevoLogro.fecha_desbloqueo
        });

      } catch (logroError) {
        console.error(`Error procesando logro ${logro.id_logros}:`, logroError.message);
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
        .eq('alumno_id_alumno', alumno.id_alumno) 
        .eq('movimiento', 'compra');
      return compras || 0;

    default:
      return 1; 
  }
}