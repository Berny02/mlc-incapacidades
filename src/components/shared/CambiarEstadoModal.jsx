import { useEffect, useState } from 'react'
import StatusBadge from './StatusBadge'

const ESTADOS = ['pendiente', 'transcrita', 'en_cobro', 'pagada', 'rechazada']

const ESTADO_LABELS = {
  pendiente:  'Pendiente',
  transcrita: 'Transcrita',
  en_cobro:   'En cobro',
  pagada:     'Pagada',
  rechazada:  'Rechazada',
}

export default function CambiarEstadoModal({ estadoActual, onConfirmar, onCancelar }) {
  const [estadoNuevo, setEstadoNuevo] = useState('')
  const [observacion, setObservacion] = useState('')

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  const opcionesDisponibles = ESTADOS.filter((e) => e !== estadoActual)
  const puedeConfirmar = estadoNuevo !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancelar} />

      <div className="relative w-full max-w-md rounded-xl bg-surface border border-muted/20 p-6 shadow-xl">
        <h3 className="text-base font-semibold text-text mb-1">Cambiar estado</h3>
        <p className="text-sm text-muted mb-5">
          Estado actual: <StatusBadge estado={estadoActual} />
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Nuevo estado *
            </label>
            <select
              value={estadoNuevo}
              onChange={(e) => setEstadoNuevo(e.target.value)}
              className="input-field"
            >
              <option value="">— Seleccionar —</option>
              {opcionesDisponibles.map((e) => (
                <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Observación <span className="text-muted">(opcional)</span>
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              placeholder="Motivo del cambio de estado..."
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-muted/10 pt-4">
          <button onClick={onCancelar} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(estadoNuevo, observacion.trim() || null)}
            disabled={!puedeConfirmar}
            className="btn-primary disabled:opacity-40"
          >
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  )
}
