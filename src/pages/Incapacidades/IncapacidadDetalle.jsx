import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIncapacidadById, cambiarEstado } from '../../services/incapacidades'
import { calcularDias, calcularValorEstimado } from '../../utils/calculadora'
import { calcularNivelAlerta } from '../../utils/alertas'
import StatusBadge from '../../components/shared/StatusBadge'
import FileUploader from '../../components/shared/FileUploader'
import CambiarEstadoModal from '../../components/shared/CambiarEstadoModal'
import { useAuth } from '../../context/AuthContext'

const TIPOS_LABEL = {
  enfermedad_general: 'Enfermedad General',
  laboral:            'Accidente Laboral',
  accidente_transito: 'Accidente de Tránsito',
  licencia:           'Licencia',
}

export default function IncapacidadDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, perfil } = useAuth()

  const [inc, setInc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalEstado, setModalEstado] = useState(false)
  const [cambiando, setCambiando] = useState(false)

  useEffect(() => {
    cargar()
  }, [id])

  async function cargar() {
    try {
      const data = await getIncapacidadById(id)
      setInc(data)
    } catch {
      toast.error('No se pudo cargar la incapacidad')
      navigate('/incapacidades')
    } finally {
      setLoading(false)
    }
  }

  async function handleCambiarEstado(estadoNuevo, observacion) {
    setModalEstado(false)
    setCambiando(true)
    try {
      await cambiarEstado(id, estadoNuevo, observacion, session?.user?.id)
      await cargar()
      toast.success(`Estado cambiado a "${estadoNuevo}"`)
    } catch {
      toast.error('Error al cambiar el estado')
    } finally {
      setCambiando(false)
    }
  }

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
  const alerta = calcularNivelAlerta(dias)
  const calculo = colaborador?.salario_base
    ? calcularValorEstimado(dias, colaborador.salario_base)
    : null

  const iniciales = colaborador?.nombre
    ?.split(' ').slice(0, 2).map((p) => p[0]).join('') ?? '?'

  const historial = inc.historial_estados ?? []

  return (
    <>
      {modalEstado && (
        <CambiarEstadoModal
          estadoActual={inc.estado}
          onConfirmar={handleCambiarEstado}
          onCancelar={() => setModalEstado(false)}
        />
      )}

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

        {/* Card información + estado */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text">Información de la incapacidad</h3>
            <button
              onClick={() => navigate(`/incapacidades/${id}/editar`)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Editar
            </button>
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

        {/* Card financiera */}
        {calculo && (
          <div className="card space-y-3">
            <h3 className="font-semibold text-text">Estimación financiera</h3>
            <div className="rounded-lg border border-muted/20 bg-bg overflow-hidden divide-y divide-muted/10">
              <FilaFinanciera
                label="Días 1–2 · Empresa (100% IBC)"
                sublabel={`IBC diario: ${cop(calculo.ibcDiario)}`}
                valor={calculo.desglose.empresa}
              />
              {dias >= 3 && (
                <FilaFinanciera
                  label={`Días 3–${Math.min(dias, 90)} · EPS (66.67% IBC)`}
                  valor={dias <= 90
                    ? calculo.desglose.eps
                    : calcularValorEstimado(90, colaborador.salario_base).desglose.eps
                  }
                />
              )}
              {dias >= 91 && (
                <FilaFinanciera
                  label={`Días 91–${Math.min(dias, 180)} · EPS (50% IBC)`}
                  valor={calculo.desglose.eps - calcularValorEstimado(90, colaborador.salario_base).desglose.eps}
                />
              )}
              <div className="flex items-center justify-between px-4 py-3 bg-accent/5">
                <span className="text-sm font-semibold text-text">Total estimado</span>
                <span className="font-mono font-bold text-accent">{cop(calculo.valorTotal)}</span>
              </div>
              {calculo.pasaAfp && (
                <div className="px-4 py-2 bg-danger/5">
                  <p className="text-xs text-danger">⚑ Supera 180 días — responsabilidad de pago pasa al Fondo de Pensiones (AFP)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card estado + semáforo */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text mb-2">Estado del trámite</h3>
              <StatusBadge estado={inc.estado} />
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${alerta.tailwind}`}>
                <span>●</span>
                <span>{alerta.mensaje}</span>
              </div>
              <p className="text-xs text-muted mt-1">{dias} días acumulados</p>
            </div>
          </div>

          <button
            onClick={() => setModalEstado(true)}
            disabled={cambiando}
            className="btn-secondary w-full justify-center disabled:opacity-40"
          >
            {cambiando ? 'Cambiando estado...' : 'Cambiar estado'}
          </button>
        </div>

        {/* Soporte médico */}
        <div className="card">
          <h3 className="mb-4 font-semibold text-text">Soporte médico</h3>
          <FileUploader
            colaboradorId={inc.colaborador_id}
            incapacidadId={inc.id}
            soportePath={inc.soporte_url}
            onActualizar={(path) => setInc((prev) => ({ ...prev, soporte_url: path }))}
          />
        </div>

        {/* Historial de estados */}
        <div className="card">
          <h3 className="mb-4 font-semibold text-text">Historial de cambios</h3>
          {historial.length === 0 ? (
            <p className="text-sm text-muted">Sin cambios de estado registrados aún.</p>
          ) : (
            <ol className="relative border-l border-muted/20 ml-2 space-y-5">
              {historial.map((h, i) => (
                <li key={h.id} className="ml-5">
                  <span className={`absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-surface ${i === historial.length - 1 ? 'bg-accent' : 'bg-muted/40'}`} />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted">
                      {new Date(h.fecha_cambio).toLocaleString('es-CO', {
                        dateStyle: 'medium', timeStyle: 'short'
                      })}
                    </span>
                    <StatusBadge estado={h.estado_anterior ?? 'pendiente'} />
                    <span className="text-muted">→</span>
                    <StatusBadge estado={h.estado_nuevo} />
                    {h.perfiles?.nombre && (
                      <span className="text-xs text-muted">por {h.perfiles.nombre}</span>
                    )}
                  </div>
                  {h.observacion && (
                    <p className="mt-1 text-xs text-muted italic">{h.observacion}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
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

function FilaFinanciera({ label, sublabel, valor }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div>
        <span className="text-sm text-muted">{label}</span>
        {sublabel && <p className="text-xs text-muted/60 mt-0.5">{sublabel}</p>}
      </div>
      <span className="font-mono text-sm text-text">{cop(valor)}</span>
    </div>
  )
}

function cop(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(valor)
}
