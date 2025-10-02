import { supabaseAdmin } from '../config/supabase.js';

/**
 * Verifica si un aula tiene espacio disponible (máximo 50 estudiantes)
 * @param {string} aulaId - ID del aula a verificar
 * @returns {Promise<boolean>} - true si hay espacio, false si está llena
 */
export async function verificarCapacidadAula(aulaId) {
  const { count: estudiantesEnAula, error: countError } = await supabaseAdmin
    .from('alumno')
    .select('*', { count: 'exact', head: true })
    .eq('aula_id_aula', aulaId);

  if (countError) {
    throw new Error('Error al verificar capacidad del aula');
  }

  return estudiantesEnAula < 50;
}

/**
 * Verifica si un docente puede crear más aulas (máximo 20 aulas)
 * @param {string} docenteId - ID del docente
 * @returns {Promise<boolean>} - true si puede crear más aulas, false si alcanzó el límite
 */
export async function verificarLimiteAulasDocente(docenteId) {
  const { count: aulasDelDocente, error: countError } = await supabaseAdmin
    .from('aula')
    .select('*', { count: 'exact', head: true })
    .eq('docente_id_docente', docenteId);

  if (countError) {
    throw new Error('Error al verificar límite de aulas del docente');
  }

  return aulasDelDocente < 20;
}

/**
 * Obtiene el número de estudiantes en un aula
 * @param {string} aulaId - ID del aula
 * @returns {Promise<number>} - Número de estudiantes en el aula
 */
export async function obtenerCantidadEstudiantesEnAula(aulaId) {
  const { count: estudiantesEnAula, error: countError } = await supabaseAdmin
    .from('alumno')
    .select('*', { count: 'exact', head: true })
    .eq('aula_id_aula', aulaId);

  if (countError) {
    throw new Error('Error al obtener cantidad de estudiantes en el aula');
  }

  return estudiantesEnAula || 0;
}

/**
 * Obtiene el número de aulas de un docente
 * @param {string} docenteId - ID del docente
 * @returns {Promise<number>} - Número de aulas del docente
 */
export async function obtenerCantidadAulasDocente(docenteId) {
  const { count: aulasDelDocente, error: countError } = await supabaseAdmin
    .from('aula')
    .select('*', { count: 'exact', head: true })
    .eq('docente_id_docente', docenteId);

  if (countError) {
    throw new Error('Error al obtener cantidad de aulas del docente');
  }

  return aulasDelDocente || 0;
}
