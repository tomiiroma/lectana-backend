import { supabaseAdmin } from '../config/supabase.js';
import { verificarCapacidadAula } from '../utils/validaciones.js';

export async function listarAlumnos({ page = 1, limit = 20, q = '', aula_id } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('alumno')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email
      ),
      aula:aula_id_aula(
        id_aula, nombre
      )
    `, { count: 'exact' })
    .range(from, to)
    .order('usuario_id_usuario', { ascending: true });

  if (q && q.trim()) {
    // Buscar por nombre/apellido/email del usuario asociado
    query = query.or(
      `usuario.nombre.ilike.%${q}%,usuario.apellido.ilike.%${q}%,usuario.email.ilike.%${q}%`
    );
  }

  if (aula_id) {
    query = query.eq('aula_id_aula', aula_id);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    items: data || [],
    page: Number(page),
    limit: Number(limit),
    total: count || 0,
    total_pages: count ? Math.ceil(count / Number(limit)) : 0
  };
}

export async function unirseAula(usuarioId, codigoAcceso) {
  // Buscar aula por código
  const { data: aula, error: aulaError } = await supabaseAdmin
    .from('aula')
    .select('id_aula, nombre, grado, seccion, docente_id_docente')
    .eq('codigo_acceso', codigoAcceso)
    .single();

  if (aulaError || !aula) {
    throw new Error('Código de aula inválido');
  }

  // Verificar si el alumno ya está en alguna aula
  const { data: alumnoExistente } = await supabaseAdmin
    .from('alumno')
    .select('aula_id_aula')
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (alumnoExistente?.aula_id_aula) {
    throw new Error('El alumno ya está registrado en un aula');
  }

  // Verificar límite de estudiantes por aula (máximo 50)
  const hayEspacio = await verificarCapacidadAula(aula.id_aula);
  
  if (!hayEspacio) {
    throw new Error('El aula ha alcanzado el límite máximo de 50 estudiantes');
  }

  // Actualizar alumno con el aula
  const { data: alumno, error: alumnoError } = await supabaseAdmin
    .from('alumno')
    .update({ aula_id_aula: aula.id_aula })
    .eq('usuario_id_usuario', usuarioId)
    .select('*')
    .single();

  if (alumnoError) {
    throw new Error('Error al unirse al aula');
  }

  return {
    alumno,
    aula: {
      id_aula: aula.id_aula,
      nombre: aula.nombre,
      grado: aula.grado,
      seccion: aula.seccion
    },
    message: 'Te has unido exitosamente al aula'
  };
}

export async function obtenerAlumnoPorId(usuarioId) {
  const { data: alumno, error } = await supabaseAdmin
    .from('alumno')
    .select(`
      *,
      usuario:usuario_id_usuario(*),
      aula:aula_id_aula(*)
    `)
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error) {
    throw new Error('Alumno no encontrado');
  }

  return alumno;
}

export async function obtenerProgresoAlumno(usuarioId) {
  // Obtener actividades completadas
  const { data: actividadesCompletadas } = await supabaseAdmin
    .from('actividad_completada')
    .select(`
      *,
      actividad:actividad_id_actividad(*)
    `)
    .eq('alumno_usuario_id_usuario', usuarioId);

  // Obtener cuentos leídos
  const { data: cuentosLeidos } = await supabaseAdmin
    .from('cuento_leido')
    .select(`
      *,
      cuento:cuento_id_cuento(*)
    `)
    .eq('alumno_usuario_id_usuario', usuarioId);

  // Calcular puntos totales
  const puntosActividades = actividadesCompletadas?.reduce((total, act) => {
    return total + (act.puntos_obtenidos || 0);
  }, 0) || 0;

  const puntosCuentos = cuentosLeidos?.reduce((total, cuento) => {
    return total + 10; // 10 puntos por cuento leído
  }, 0) || 0;

  const puntosTotales = puntosActividades + puntosCuentos;

  return {
    puntos_totales: puntosTotales,
    actividades_completadas: actividadesCompletadas?.length || 0,
    cuentos_leidos: cuentosLeidos?.length || 0,
    actividades: actividadesCompletadas || [],
    cuentos: cuentosLeidos || []
  };
}
