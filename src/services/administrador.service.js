import { supabaseAdmin } from '../config/supabase.js';
import { actualizarUsuario } from './usuario.service.js';

export async function listarAdministradores({ page = 1, limit = 20, q = '', activo } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabaseAdmin
    .from('administrador')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email
      )
    `, { count: 'exact' })
    .range(from, to)
    .order('id_administrador', { ascending: true });

  if (q && q.trim()) {
    query = query.or(
      `usuario.nombre.ilike.%${q}%,usuario.apellido.ilike.%${q}%,usuario.email.ilike.%${q}%`
    );
  }

  if (typeof activo === 'boolean') {
    query = query.eq('usuario.activo', activo);
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

export async function crearAdministrador({ dni, usuario_id_usuario }) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .insert([{ dni, usuario_id_usuario }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerAdministradorPorId(id_administrador) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .select('*')
    .eq('id_administrador', id_administrador)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarAdministrador(id_administrador, updates) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .update(updates)
    .eq('id_administrador', id_administrador)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerPerfilAdministrador(usuarioId) {
  const { data, error } = await supabaseAdmin
    .from('administrador')
    .select(`
      *,
      usuario:usuario_id_usuario(
        id_usuario, nombre, apellido, email, edad
      )
    `)
    .eq('usuario_id_usuario', usuarioId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Administrador no encontrado');
    }
    throw new Error('Error al obtener perfil: ' + error.message);
  }

  return data;
}

export async function actualizarPerfilAdministrador(usuarioId, updates) {
  // Separar campos de usuario y administrador
  const usuarioUpdates = {};
  const adminUpdates = {};

  if (updates.nombre) usuarioUpdates.nombre = updates.nombre;
  if (updates.apellido) usuarioUpdates.apellido = updates.apellido;
  if (updates.email) usuarioUpdates.email = updates.email;
  if (updates.edad) usuarioUpdates.edad = updates.edad;

  if (updates.dni) adminUpdates.dni = updates.dni;

  // Actualizar usuario si hay cambios
  if (Object.keys(usuarioUpdates).length > 0) {
    await actualizarUsuario(usuarioId, usuarioUpdates);
  }

  // Actualizar administrador si hay cambios
  if (Object.keys(adminUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from('administrador')
      .update(adminUpdates)
      .eq('usuario_id_usuario', usuarioId);

    if (error) {
      throw new Error('Error al actualizar datos de administrador: ' + error.message);
    }
  }

  // Retornar perfil actualizado
  return await obtenerPerfilAdministrador(usuarioId);
}

export async function obtenerEstadisticasUsuarios() {
  try {
    // Obtener estadísticas generales de usuarios
    const { data: usuariosActivos, error: errorActivos } = await supabaseAdmin
      .from('usuario')
      .select('id_usuario', { count: 'exact' })
      .eq('activo', true);

    const { data: usuariosInactivos, error: errorInactivos } = await supabaseAdmin
      .from('usuario')
      .select('id_usuario', { count: 'exact' })
      .eq('activo', false);

    // Obtener totales por tipo de usuario
    const { data: estudiantes, error: errorEstudiantes } = await supabaseAdmin
      .from('alumno')
      .select('id_alumno', { count: 'exact' });

    const { data: docentes, error: errorDocentes } = await supabaseAdmin
      .from('docente')
      .select('id_docente', { count: 'exact' });

    const { data: administradores, error: errorAdmins } = await supabaseAdmin
      .from('administrador')
      .select('id_administrador', { count: 'exact' });

    // Obtener usuarios activos por tipo de rol
    const { data: estudiantesActivos, error: errorEstudiantesActivos } = await supabaseAdmin
      .from('alumno')
      .select(`
        id_alumno,
        usuario:usuario_id_usuario!inner(activo)
      `, { count: 'exact' })
      .eq('usuario.activo', true);

    const { data: docentesActivos, error: errorDocentesActivos } = await supabaseAdmin
      .from('docente')
      .select(`
        id_docente,
        usuario:usuario_id_usuario!inner(activo)
      `, { count: 'exact' })
      .eq('usuario.activo', true);

    const { data: administradoresActivos, error: errorAdminsActivos } = await supabaseAdmin
      .from('administrador')
      .select(`
        id_administrador,
        usuario:usuario_id_usuario!inner(activo)
      `, { count: 'exact' })
      .eq('usuario.activo', true);

    if (errorActivos || errorInactivos || errorEstudiantes || errorDocentes || errorAdmins ||
        errorEstudiantesActivos || errorDocentesActivos || errorAdminsActivos) {
      throw new Error('Error al obtener estadísticas');
    }

    return {
      total_docentes: docentes?.length || 0,
      total_alumnos: estudiantes?.length || 0,
      total_administradores: administradores?.length || 0,
      total_usuarios: (usuariosActivos?.length || 0) + (usuariosInactivos?.length || 0),
      usuarios_activos: usuariosActivos?.length || 0,
      usuarios_inactivos: usuariosInactivos?.length || 0,
      estudiantes_activos: estudiantesActivos?.length || 0,
      docentes_activos: docentesActivos?.length || 0,
      administradores_activos: administradoresActivos?.length || 0
    };
  } catch (error) {
    throw new Error('Error al obtener estadísticas: ' + error.message);
  }
}

export async function obtenerTodosUsuariosActivos({ page = 1, limit = 20, q = '' } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  // Obtener usuarios activos con sus roles
  let usuariosQuery = supabaseAdmin
    .from('usuario')
    .select('*', { count: 'exact' })
    .eq('activo', true)
    .range(from, to)
    .order('id_usuario', { ascending: true });

  if (q && q.trim()) {
    usuariosQuery = usuariosQuery.or(
      `nombre.ilike.%${q}%,apellido.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: usuarios, error: usuariosError, count } = await usuariosQuery;
  if (usuariosError) throw new Error(usuariosError.message);

  // Para cada usuario, determinar su rol y obtener datos específicos
  const usuariosConRoles = await Promise.all(
    usuarios.map(async (usuario) => {
      let rol = 'alumno';
      let datosRol = {};

      // Verificar si es docente
      const { data: docente } = await supabaseAdmin
        .from('docente')
        .select('*')
        .eq('usuario_id_usuario', usuario.id_usuario)
        .maybeSingle();

      if (docente) {
        rol = 'docente';
        datosRol = {
          institucion_nombre: docente.institucion_nombre,
          verificado: docente.verificado
        };
      } else {
        // Verificar si es administrador
        const { data: administrador } = await supabaseAdmin
          .from('administrador')
          .select('*')
          .eq('usuario_id_usuario', usuario.id_usuario)
          .maybeSingle();

        if (administrador) {
          rol = 'administrador';
          datosRol = {
            dni: administrador.dni
          };
        } else {
          // Es alumno, obtener datos del aula
          const { data: alumno } = await supabaseAdmin
            .from('alumno')
            .select('aula_id_aula')
            .eq('usuario_id_usuario', usuario.id_usuario)
            .maybeSingle();

          if (alumno) {
            datosRol = {
              aula_id_aula: alumno.aula_id_aula
            };
          }
        }
      }

      return {
        ...usuario,
        rol,
        datos_rol: datosRol
      };
    })
  );

  return {
    items: usuariosConRoles,
    page: Number(page),
    limit: Number(limit),
    total: count || 0,
    total_pages: count ? Math.ceil(count / Number(limit)) : 0
  };
}

export async function obtenerTodosUsuariosInactivos({ page = 1, limit = 20, q = '' } = {}) {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  // Obtener usuarios inactivos con sus roles
  let usuariosQuery = supabaseAdmin
    .from('usuario')
    .select('*', { count: 'exact' })
    .eq('activo', false)
    .range(from, to)
    .order('id_usuario', { ascending: true });

  if (q && q.trim()) {
    usuariosQuery = usuariosQuery.or(
      `nombre.ilike.%${q}%,apellido.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: usuarios, error: usuariosError, count } = await usuariosQuery;
  if (usuariosError) throw new Error(usuariosError.message);

  // Para cada usuario, determinar su rol y obtener datos específicos
  const usuariosConRoles = await Promise.all(
    usuarios.map(async (usuario) => {
      let rol = 'alumno';
      let datosRol = {};

      // Verificar si es docente
      const { data: docente } = await supabaseAdmin
        .from('docente')
        .select('*')
        .eq('usuario_id_usuario', usuario.id_usuario)
        .maybeSingle();

      if (docente) {
        rol = 'docente';
        datosRol = {
          institucion_nombre: docente.institucion_nombre,
          verificado: docente.verificado
        };
      } else {
        // Verificar si es administrador
        const { data: administrador } = await supabaseAdmin
          .from('administrador')
          .select('*')
          .eq('usuario_id_usuario', usuario.id_usuario)
          .maybeSingle();

        if (administrador) {
          rol = 'administrador';
          datosRol = {
            dni: administrador.dni
          };
        } else {
          // Es alumno, obtener datos del aula
          const { data: alumno } = await supabaseAdmin
            .from('alumno')
            .select('aula_id_aula')
            .eq('usuario_id_usuario', usuario.id_usuario)
            .maybeSingle();

          if (alumno) {
            datosRol = {
              aula_id_aula: alumno.aula_id_aula
            };
          }
        }
      }

      return {
        ...usuario,
        rol,
        datos_rol: datosRol
      };
    })
  );

  return {
    items: usuariosConRoles,
    page: Number(page),
    limit: Number(limit),
    total: count || 0,
    total_pages: count ? Math.ceil(count / Number(limit)) : 0
  };
}
