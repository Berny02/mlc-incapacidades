import * as XLSX from 'xlsx'
import { supabase } from '../services/supabaseClient'

export async function exportarIncapacidades(filtros = {}) {
  let query = supabase
    .from('incapacidades')
    .select('*, colaboradores(nombre, cedula, area)')

  if (filtros.estado) query = query.eq('estado', filtros.estado)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.desde) query = query.gte('fecha_inicio', filtros.desde)
  if (filtros.hasta) query = query.lte('fecha_fin', filtros.hasta)

  const { data, error } = await query
  if (error) throw error

  const filas = data.map((i) => ({
    Colaborador: i.colaboradores?.nombre ?? '',
    Cédula: i.colaboradores?.cedula ?? '',
    Área: i.colaboradores?.area ?? '',
    Tipo: i.tipo,
    Diagnóstico: i.diagnostico ?? '',
    'Fecha Inicio': i.fecha_inicio,
    'Fecha Fin': i.fecha_fin,
    Días: Math.floor((new Date(i.fecha_fin) - new Date(i.fecha_inicio)) / 86400000) + 1,
    Estado: i.estado,
    Origen: i.origen ?? '',
    Observaciones: i.observaciones ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Incapacidades')

  const fecha = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `reporte_incapacidades_${fecha}.xlsx`)
}

export async function exportarCSV(filtros = {}) {
  let query = supabase
    .from('incapacidades')
    .select('*, colaboradores(nombre, cedula, area)')

  if (filtros.estado) query = query.eq('estado', filtros.estado)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)

  const { data, error } = await query
  if (error) throw error

  const filas = data.map((i) => ({
    Colaborador: i.colaboradores?.nombre ?? '',
    Cédula: i.colaboradores?.cedula ?? '',
    Tipo: i.tipo,
    'Fecha Inicio': i.fecha_inicio,
    'Fecha Fin': i.fecha_fin,
    Estado: i.estado,
  }))

  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Incapacidades')

  const fecha = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `reporte_incapacidades_${fecha}.csv`, { bookType: 'csv' })
}
