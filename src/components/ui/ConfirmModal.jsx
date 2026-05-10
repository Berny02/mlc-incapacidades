import { useEffect } from 'react'

export default function ConfirmModal({ titulo, mensaje, labelConfirmar = 'Eliminar', onConfirmar, onCancelar }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancelar}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-xl bg-surface border border-muted/20 p-6 shadow-xl">
        <h3 className="text-base font-semibold text-text mb-2">{titulo}</h3>
        <p className="text-sm text-muted mb-6">{mensaje}</p>

        <div className="flex justify-end gap-3">
          <button onClick={onCancelar} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="bg-danger hover:bg-danger/80 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
