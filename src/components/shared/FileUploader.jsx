import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { uploadSoporte, getUrlSoporte, validarArchivo } from '../../services/storage'
import { updateIncapacidad } from '../../services/incapacidades'

export default function FileUploader({ colaboradorId, incapacidadId, soportePath, onActualizar }) {
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [urlVista, setUrlVista] = useState(null)

  useEffect(() => {
    if (soportePath) {
      getUrlSoporte(soportePath).then(setUrlVista)
    } else {
      setUrlVista(null)
    }
  }, [soportePath])

  async function handleArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validarArchivo(file)
    if (error) {
      toast.error(error)
      return
    }

    setSubiendo(true)
    try {
      const path = await uploadSoporte(colaboradorId, incapacidadId, file)
      await updateIncapacidad(incapacidadId, { soporte_url: path })
      const url = await getUrlSoporte(path)
      setUrlVista(url)
      onActualizar?.(path)
      toast.success('Soporte adjuntado correctamente')
    } catch {
      toast.error('Error al subir el archivo. Intenta de nuevo.')
    } finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {soportePath ? (
        <div className="flex items-center gap-3 rounded-lg border border-muted/20 bg-bg px-4 py-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <span className="text-accent text-sm font-bold">
              {soportePath.endsWith('.pdf') ? 'PDF' : 'IMG'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {soportePath.split('/').pop()}
            </p>
            <p className="text-xs text-muted">Soporte adjunto</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {urlVista && (
              <a
                href={urlVista}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Ver
              </a>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
              className="text-xs font-medium text-muted hover:text-text transition-colors disabled:opacity-40"
            >
              Reemplazar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-muted/30 bg-bg px-4 py-4 text-left transition-colors hover:border-accent/50 hover:bg-accent/5 disabled:opacity-50"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface">
            <span className="text-muted text-lg">↑</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text">
              {subiendo ? 'Subiendo archivo...' : 'Adjuntar soporte médico'}
            </p>
            <p className="text-xs text-muted">PDF, JPG o PNG · Máx. 10 MB</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleArchivo}
        className="hidden"
      />
    </div>
  )
}
