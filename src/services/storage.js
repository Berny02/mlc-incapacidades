import { supabase } from './supabaseClient'

const BUCKET = 'soportes-medicos'
const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png']
const TAMANO_MAX_MB = 10

export function validarArchivo(file) {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return 'Solo se permiten archivos PDF, JPG o PNG'
  }
  if (file.size > TAMANO_MAX_MB * 1024 * 1024) {
    return `El archivo no puede superar ${TAMANO_MAX_MB} MB`
  }
  return null
}

export async function uploadSoporte(colaboradorId, incapacidadId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${colaboradorId}/${incapacidadId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw error
  return path
}

export async function getUrlSoporte(path) {
  if (!path) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60) // 1 hora
  if (error) return null
  return data.signedUrl
}

export async function deleteSoporte(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}
