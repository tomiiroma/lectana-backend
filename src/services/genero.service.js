import { supabaseAdmin } from '../config/supabase.js';

export async function crearGenero(data) {
  const { data: genero, error } = await supabaseAdmin
    .from('genero')
    .insert({ nombre: data.nombre })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear género: ${error.message}`);
  }

  return genero;
}

export async function obtenerGeneroPorId(id) {
  const { data: genero, error } = await supabaseAdmin
    .from('genero')
    .select('*')
    .eq('id_genero', id)
    .single();

  if (error) {
    throw new Error('Género no encontrado');
  }

  return genero;
}

export async function listarGeneros() {
  const { data: generos, error } = await supabaseAdmin
    .from('genero')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al listar géneros: ${error.message}`);
  }

  return generos;
}

export async function actualizarGenero(id, data) {
  const { data: genero, error } = await supabaseAdmin
    .from('genero')
    .update(data)
    .eq('id_genero', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar género: ${error.message}`);
  }

  return genero;
}

export async function eliminarGenero(id) {
  const { error } = await supabaseAdmin
    .from('genero')
    .delete()
    .eq('id_genero', id);

  if (error) {
    throw new Error(`Error al eliminar género: ${error.message}`);
  }

  return { message: 'Género eliminado exitosamente' };
}
