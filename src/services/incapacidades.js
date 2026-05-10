import { supabase } from './supabaseClient'

export async function getIncapacidades() {
  const { data, error } = await supabase
    .from('incapacidades')
    .select(`
      *,
      colaboradores (id, nombre, cedula, cargo, area, salario_base)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getIncapacidadById(id) {
  const { data, error } = await supabase
    .from('incapacidades')
    .select(`
      *,
      colaboradores (id, nombre, cedula, cargo, area, eps, arl, salario_base),
      historial_estados (
        id, estado_anterior, estado_nuevo, fecha_cambio, observacion,
        perfiles (nombre)
      )
    `)
    .eq('id', id)
    .order('fecha_cambio', { foreignTable: 'historial_estados', ascending: true })
    .single()
  if (error) throw error
  return data
}

export async function createIncapacidad(incapacidad) {
  const { data, error } = await supabase
    .from('incapacidades')
    .insert(incapacidad)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateIncapacidad(id, updates) {
  const { data, error } = await supabase
    .from('incapacidades')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cambiarEstado(incapacidadId, estadoNuevo, observacion, userId) {
  const { data: actual, error: fetchError } = await supabase
    .from('incapacidades')
    .select('estado')
    .eq('id', incapacidadId)
    .single()
  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('incapacidades')
    .update({ estado: estadoNuevo })
    .eq('id', incapacidadId)
  if (updateError) throw updateError

  const { error: historialError } = await supabase
    .from('historial_estados')
    .insert({
      incapacidad_id: incapacidadId,
      estado_anterior: actual.estado,
      estado_nuevo: estadoNuevo,
      cambiado_por: userId,
      observacion,
    })
  if (historialError) throw historialError
}
