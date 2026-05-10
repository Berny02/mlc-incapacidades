import { supabase } from './supabaseClient'

export async function getColaboradores() {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data
}

export async function createColaborador(colaborador) {
  const { data, error } = await supabase
    .from('colaboradores')
    .insert(colaborador)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateColaborador(id, updates) {
  const { data, error } = await supabase
    .from('colaboradores')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteColaborador(id) {
  const { error } = await supabase
    .from('colaboradores')
    .delete()
    .eq('id', id)
  if (error) throw error
}
