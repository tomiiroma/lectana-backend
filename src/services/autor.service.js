import { supabaseAdmin } from '../config/supabase.js';

export async function crearAutor(data) {
  const { data: autor, error } = await supabaseAdmin
    .from('autor')
    .insert({ nombre: data.nombre, apellido: data.apellido })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear autor: ${error.message}`);
  }

  return autor;
}

export async function obtenerAutorPorId(id) {
  const { data: autor, error } = await supabaseAdmin
    .from('autor')
    .select('*')
    .eq('id_autor', id)
    .single();

  if (error) {
    throw new Error('Autor no encontrado');
  }

  return autor;
}

export async function listarAutores() {
  const { data: autores, error } = await supabaseAdmin
    .from('autor')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error al listar autores: ${error.message}`);
  }

  return autores;
}

export async function actualizarAutor(id, data) {
  const { data: autor, error } = await supabaseAdmin
    .from('autor')
    .update(data)
    .eq('id_autor', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar autor: ${error.message}`);
  }

  return autor;
}

export async function eliminarAutor(id) {
  const { error } = await supabaseAdmin
    .from('autor')
    .delete()
    .eq('id_autor', id);

  if (error) {
    throw new Error(`Error al eliminar autor: ${error.message}`);
  }

  return { message: 'Autor eliminado exitosamente' };
}
