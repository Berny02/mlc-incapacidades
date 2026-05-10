import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIncapacidadById } from '../../services/incapacidades'
import { calcularDias } from '../../utils/calculadora'
import StatusBadge from '../../components/shared/StatusBadge'

const TIPOS_LABEL = {
  enfermedad_general: 'Enfermedad General',
  laboral:            'Accidente Laboral',
  accidente_transito: 'Accidente de Tránsito',
  licencia:           'Licencia',
}

export default function IncapacidadDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inc, setInc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIncapacidadById(id)
      .then(setInc)
      .catch(() => {
        toast.error('No se pudo cargar la incapacidad')
        navigate('/incapacidades')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!inc) return null

  const colaborador = inc.colaboradores
  const dias = calcularDias(inc.fecha_inicio, inc.fecha_fin)
  const iniciales = colaborador?.nombre
    ?.split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('') ?? '?'

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Encabezado */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/incapacidades')}
          className="text-muted hover:text-text text-sm transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-semibold text-text">Detalle de incapacidad</h2>
      </div>

      {/* Card colaborador */}
      <div className="card flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 font-semibold text-accent">
          {iniciales}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text">{colaborador?.nombre ?? '—'}</p>
          <p className="text-sm text-muted">
            CC {colaborador?.cedula ?? '—'} · {colaborador?.cargo ?? '—'} · {colaborador?.area ?? '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">EPS / ARL</p>
          <p className="text-sm text-text">{colaborador?.eps ?? '—'} / {colaborador?.arl ?? '—'}</p>
        </div>
      </div>

      {/* Card información de la incapacidad */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text">Información de la incapacidad</h3>
          <div className="flex items-center gap-3">
            <StatusBadge estado={inc.estado} />
            <button
              onClick={() => navigate(`/incapacidades/${id}/editar`)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Dato label="Tipo" valor={TIPOS_LABEL[inc.tipo] ?? inc.tipo} />
          <Dato label="Diagnóstico" valor={inc.diagnostico} />
          <Dato label="Fecha inicio" valor={inc.fecha_inicio} mono />
          <Dato label="Fecha fin" valor={inc.fecha_fin} mono />
          <Dato label="Días de incapacidad" valor={`${dias} días`} mono />
          <Dato label="Origen" valor={inc.origen} />
        </div>

        {inc.observaciones && (
          <div className="border-t border-muted/10 pt-4">
            <p className="mb-1 text-xs font-medium text-muted">Observaciones</p>
            <p className="text-sm text-text">{inc.observaciones}</p>
          </div>
        )}
      </div>

      {/* Sección de documentos — placeholder para Tarea 2.2 */}
      <div className="card">
        <h3 className="mb-3 font-semibold text-text">Soporte médico</h3>
        {inc.soporte_url ? (
          <a
            href={inc.soporte_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Ver documento
          </a>
        ) : (
          <p className="text-sm text-muted">
            Sin soporte adjunto · La subida de archivos se implementa en la Tarea 2.2
          </p>
        )}
      </div>

      {/* Historial de estados — placeholder para Tarea 2.3 */}
      <div className="card">
        <h3 className="mb-3 font-semibold text-text">Historial de cambios</h3>
        {inc.historial_estados?.length > 0 ? (
          <ol className="space-y-3">
            {inc.historial_estados.map((h) => (
              <li key={h.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                <div>
                  <span className="text-muted font-mono">
                    {new Date(h.fecha_cambio).toLocaleDateString('es-CO')}
                  </span>
                  {' — '}
                  <span className="text-text">
                    {h.estado_anterior ?? 'inicio'} → <strong>{h.estado_nuevo}</strong>
                  </span>
                  {h.observacion && (
                    <p className="text-muted mt-0.5">{h.observacion}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">Sin cambios de estado registrados</p>
        )}
      </div>
    </div>
  )
}

function Dato({ label, valor, mono }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted mb-0.5">{label}</p>
      <p className={`text-text ${mono ? 'font-mono' : ''}`}>{valor ?? '—'}</p>
    </div>
  )
}
