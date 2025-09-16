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
  try {
    // Consulta optimizada: obtener aula con docente en una sola consulta
    const { data: aula, error: aulaError } = await supabaseAdmin
      .from('aula')
      .select(`
        *,
        docente:docente_id_docente(
          *,
          usuario:usuario_id_usuario(nombre, apellido, email)
        )
      `)
      .eq('id_aula', id)
      .single();

    if (aulaError) {
      throw new Error('Aula no encontrada');
    }

    // Consultas paralelas para estudiantes y cuentos (más eficiente)
    const [estudiantesResult, cuentosResult] = await Promise.all([
      supabaseAdmin
        .from('alumno_has_aula')
        .select(`
          alumno:alumno_id_alumno(
            id_alumno,
            usuario:usuario_id_usuario(nombre, apellido, email)
          )
        `)
        .eq('aula_id_aula', id),
      
      supabaseAdmin
        .from('aula_has_cuento')
        .select(`
          cuento:cuento_id_cuento(
            id_cuento,
            titulo,
            edad_publico,
            autor:autor_id_autor(nombre, apellido),
            genero:genero_id_genero(nombre)
          )
        `)
        .eq('aula_id_aula', id)
    ]);

    // Verificar errores
    if (estudiantesResult.error) {
      throw new Error(`Error al obtener estudiantes: ${estudiantesResult.error.message}`);
    }
    
    if (cuentosResult.error) {
      throw new Error(`Error al obtener cuentos: ${cuentosResult.error.message}`);
    }

    // Formatear la respuesta
    const estudiantes = estudiantesResult.data?.map(item => ({
      id: item.alumno.id_alumno,
      usuario: item.alumno.usuario
    })) || [];

    const cuentos = cuentosResult.data?.map(item => ({
      id: item.cuento.id_cuento,
      titulo: item.cuento.titulo,
      edad_publico: item.cuento.edad_publico,
      autor: item.cuento.autor,
      genero: item.cuento.genero
    })) || [];

    return {
      ...aula,
      estudiantes,
      cuentos,
      total_estudiantes: estudiantes.length,
      total_cuentos: cuentos.length,
      estadisticas: {
        total_estudiantes: estudiantes.length,
        total_cuentos: cuentos.length,
        tiene_docente: aula.docente_id_docente !== null
      }
    };
  } catch (error) {
    throw new Error(`Error al obtener aula: ${error.message}`);
  }
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

  // Formatear la respuesta para incluir nombre completo del docente
  const aulasFormateadas = aulas.map(aula => ({
    ...aula,
    docente_nombre: aula.docente?.usuario ? 
      `${aula.docente.usuario.nombre} ${aula.docente.usuario.apellido}` : 
      null
  }));

  return aulasFormateadas;
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

// Asignar múltiples estudiantes a un aula (reemplaza asignaciones existentes)
export async function asignarEstudiantesAula(aulaId, estudiantesIds) {
  try {
    // Verificar que el aula existe
    const { data: aula, error: aulaError } = await supabaseAdmin
      .from('aula')
      .select('id_aula')
      .eq('id_aula', aulaId)
      .single();

    if (aulaError || !aula) {
      throw new Error('Aula no encontrada');
    }

    // Verificar que todos los estudiantes existen
    if (estudiantesIds.length > 0) {
      const { data: estudiantes, error: estudiantesError } = await supabaseAdmin
        .from('alumno')
        .select('id_alumno')
        .in('id_alumno', estudiantesIds);

      if (estudiantesError) {
        throw new Error(`Error al verificar estudiantes: ${estudiantesError.message}`);
      }

      if (estudiantes.length !== estudiantesIds.length) {
        throw new Error('Uno o más estudiantes no existen');
      }
    }

    // Eliminar asignaciones existentes
    const { error: deleteError } = await supabaseAdmin
      .from('alumno_has_aula')
      .delete()
      .eq('aula_id_aula', aulaId);

    if (deleteError) {
      throw new Error(`Error al eliminar asignaciones existentes: ${deleteError.message}`);
    }

    // Insertar nuevas asignaciones
    if (estudiantesIds.length > 0) {
      const nuevasAsignaciones = estudiantesIds.map(estudianteId => ({
        aula_id_aula: aulaId,
        alumno_id_alumno: estudianteId
      }));

      const { error: insertError } = await supabaseAdmin
        .from('alumno_has_aula')
        .insert(nuevasAsignaciones);

      if (insertError) {
        throw new Error(`Error al asignar estudiantes: ${insertError.message}`);
      }
    }

    return {
      aula_id: aulaId,
      estudiantes_asignados: estudiantesIds.length,
      estudiantes_ids: estudiantesIds
    };
  } catch (error) {
    throw new Error(`Error al asignar estudiantes al aula: ${error.message}`);
  }
}

// Asignar múltiples cuentos a un aula (reemplaza asignaciones existentes)
export async function asignarCuentosAula(aulaId, cuentosIds) {
  try {
    // Verificar que el aula existe
    const { data: aula, error: aulaError } = await supabaseAdmin
      .from('aula')
      .select('id_aula')
      .eq('id_aula', aulaId)
      .single();

    if (aulaError || !aula) {
      throw new Error('Aula no encontrada');
    }

    // Verificar que todos los cuentos existen
    if (cuentosIds.length > 0) {
      const { data: cuentos, error: cuentosError } = await supabaseAdmin
        .from('cuento')
        .select('id_cuento')
        .in('id_cuento', cuentosIds);

      if (cuentosError) {
        throw new Error(`Error al verificar cuentos: ${cuentosError.message}`);
      }

      if (cuentos.length !== cuentosIds.length) {
        throw new Error('Uno o más cuentos no existen');
      }
    }

    // Eliminar asignaciones existentes
    const { error: deleteError } = await supabaseAdmin
      .from('aula_has_cuento')
      .delete()
      .eq('aula_id_aula', aulaId);

    if (deleteError) {
      throw new Error(`Error al eliminar asignaciones existentes: ${deleteError.message}`);
    }

    // Insertar nuevas asignaciones
    if (cuentosIds.length > 0) {
      const nuevasAsignaciones = cuentosIds.map(cuentoId => ({
        aula_id_aula: aulaId,
        cuento_id_cuento: cuentoId
      }));

      const { error: insertError } = await supabaseAdmin
        .from('aula_has_cuento')
        .insert(nuevasAsignaciones);

      if (insertError) {
        throw new Error(`Error al asignar cuentos: ${insertError.message}`);
      }
    }

    return {
      aula_id: aulaId,
      cuentos_asignados: cuentosIds.length,
      cuentos_ids: cuentosIds
    };
  } catch (error) {
    throw new Error(`Error al asignar cuentos al aula: ${error.message}`);
  }
}