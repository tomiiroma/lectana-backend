import { supabaseAdmin } from '../config/supabase.js';
import { verificarCapacidadAula } from '../utils/validaciones.js';
import { crearUsuario } from './usuario.service.js';

export async function crearAlumno({ nombre, apellido, email, edad, password, aula_id }) {
  // Crear usuario primero
  const usuario = await crearUsuario({ nombre, apellido, email, edad, password });
  
  // Crear alumno asociado al usuario
  const alumnoData = {
    usuario_id_usuario: usuario.id_usuario,
    nacionalidad: null, // Opcional según tu esquema
    alumno_col: null,   // Opcional según tu esquema
    aula_id_aula: aula_id || null // FK directa a aula
  };

  const { data: alumno, error } = await supabaseAdmin
    .from('alumno')
    .insert(alumnoData)
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
      )
    `)
    .single();

  if (error) {
    throw new Error('Error al crear alumno: ' + error.message);
  }

  // Si se proporciona aula_id, crear también la relación en alumno_has_aula
  if (aula_id) {
    // Verificar límite de estudiantes por aula (máximo 50)
    const hayEspacio = await verificarCapacidadAula(aula_id);
    
    if (!hayEspacio) {
      throw new Error('El aula ha alcanzado el límite máximo de 50 estudiantes');
    }
    
    // Crear relación en tabla intermedia
    const { error: relacionError } = await supabaseAdmin
      .from('alumno_has_aula')
      .insert({
        alumno_id_alumno: alumno.id_alumno,
        aula_id_aula: aula_id
      });

    if (relacionError) {
      throw new Error('Error al asignar alumno al aula: ' + relacionError.message);
    }
  }

  return {
    alumno,
    message: 'Alumno creado exitosamente'
  };
}

export async function listarAlumnos({ page = 1, limit = 20, q = '', aula_id } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('alumno')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
      )
    `, { count: 'exact' })
    .range(from, to)
    .order('id_alumno', { ascending: true });

  if (q && q.trim()) {
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

