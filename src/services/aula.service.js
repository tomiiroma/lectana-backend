import { supabaseAdmin } from '../config/supabase.js';

// Generar código de acceso aleatorio
function generarCodigoAcceso() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Verificar si el código ya existe
async function codigoExiste(codigo) {
  const { data, error } = await supabaseAdmin
    .from('aula')
    .select('codigo_acceso')
    .eq('codigo_acceso', codigo)
    .single();
  
  return !error && data !== null;
}

// Generar código único
async function generarCodigoUnico() {
  let codigo;
  let existe = true;
  
  while (existe) {
    codigo = generarCodigoAcceso();
    existe = await codigoExiste(codigo);
  }
  
  return codigo;
}

export async function crearAula(data) {
  try {
    // Generar código de acceso único
    const codigoAcceso = await generarCodigoUnico();
    
    const aulaData = {
      nombre_aula: data.nombre_aula,
      grado: data.grado,
      codigo_acceso: codigoAcceso,
      docente_id_docente: null
    };

    const { data: aula, error } = await supabaseAdmin
      .from('aula')
      .insert(aulaData)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al crear aula: ${error.message}`);
    }

    return aula;
  } catch (error) {
    throw new Error(`Error al procesar aula: ${error.message}`);
  }
}

export async function obtenerAulaPorId(id) {
  const { data: aula, error } = await supabaseAdmin
    .from('aula')
    .select(`
      *,
      docente:docente_id_docente(
        *,
        usuario:usuario_id_usuario(nombre, apellido)
      )
    `)
    .eq('id_aula', id)
    .single();

  if (error) {
    throw new Error('Aula no encontrada');
  }

  return aula;
}

export async function listarAulas() {
  const { data: aulas, error } = await supabaseAdmin
    .from('aula')
    .select(`
      id_aula,
      nombre_aula,
      grado,
      codigo_acceso,
      docente_id_docente,
      docente:docente_id_docente(
        usuario_id_usuario,
        usuario:usuario_id_usuario(nombre, apellido)
      )
    `)
    .order('nombre_aula', { ascending: true });

  if (error) {
    throw new Error(`Error al listar aulas: ${error.message}`);
  }

  return aulas;
}

export async function actualizarAula(id, data) {
  const { data: aula, error } = await supabaseAdmin
    .from('aula')
    .update(data)
    .eq('id_aula', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar aula: ${error.message}`);
  }

  return aula;
}

export async function eliminarAula(id) {
  const { error } = await supabaseAdmin
    .from('aula')
    .delete()
    .eq('id_aula', id);

  if (error) {
    throw new Error(`Error al eliminar aula: ${error.message}`);
  }

  return { message: 'Aula eliminada exitosamente' };
}

// Asignar cuento al aula
export async function asignarCuentoAula(aulaId, cuentoId) {
  const { data, error } = await supabaseAdmin
    .from('aula_has_cuento')
    .insert({
      aula_id_aula: aulaId,
      cuento_id_cuento: cuentoId
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al asignar cuento al aula: ${error.message}`);
  }

  return data;
}

// Quitar cuento del aula
export async function quitarCuentoAula(aulaId, cuentoId) {
  const { error } = await supabaseAdmin
    .from('aula_has_cuento')
    .delete()
    .eq('aula_id_aula', aulaId)
    .eq('cuento_id_cuento', cuentoId);

  if (error) {
    throw new Error(`Error al quitar cuento del aula: ${error.message}`);
  }

  return { message: 'Cuento quitado del aula exitosamente' };
}

// Asignar alumno al aula
export async function asignarAlumnoAula(aulaId, alumnoId) {
  const { data, error } = await supabaseAdmin
    .from('alumno_has_aula')
    .insert({
      aula_id_aula: aulaId,
      alumno_id_alumno: alumnoId
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al asignar alumno al aula: ${error.message}`);
  }

  return data;
}

// Quitar alumno del aula
export async function quitarAlumnoAula(aulaId, alumnoId) {
  const { error } = await supabaseAdmin
    .from('alumno_has_aula')
    .delete()
    .eq('aula_id_aula', aulaId)
    .eq('alumno_id_alumno', alumnoId);

  if (error) {
    throw new Error(`Error al quitar alumno del aula: ${error.message}`);
  }

  return { message: 'Alumno quitado del aula exitosamente' };
}

// Asignar docente al aula
export async function asignarDocenteAula(aulaId, docenteId) {
  const { data, error } = await supabaseAdmin
    .from('aula')
    .update({ docente_id_docente: docenteId })
    .eq('id_aula', aulaId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al asignar docente al aula: ${error.message}`);
  }

  return data;
}

// Quitar docente del aula
export async function quitarDocenteAula(aulaId) {
  const { data, error } = await supabaseAdmin
    .from('aula')
    .update({ docente_id_docente: null })
    .eq('id_aula', aulaId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al quitar docente del aula: ${error.message}`);
  }

  return data;
}

// Contar total de aulas
export async function contarAulas() {
  const { count, error } = await supabaseAdmin
    .from('aula')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Error al contar aulas: ${error.message}`);
  }

  return count ?? 0;
}