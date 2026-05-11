import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIncapacidades } from '../services/incapacidades'
import { calcularDias } from '../utils/calculadora'
import { calcularNivelAlerta } from '../utils/alertas'
import StatusBadge from '../components/shared/StatusBadge'

const GRUPOS = [
  {
    nivel: 'critica',
    titulo: 'Crítica — Día 180+',
    desc: 'Responsabilidad de pago trasladada al Fondo de Pensiones (AFP)',
    clase: 'border-danger/30 bg-danger/5',
    claseHeader: 'text-danger',
  },
  {
    nivel: 'afp',
    titulo: 'Envío AFP — Día 150',
    desc: 'Plazo límite para enviar soportes al Fondo de Pensiones',
    clase: 'border-warning/30 bg-warning/5',
    claseHeader: 'text-warning',
  },
  {
    nivel: 'rehabilitacion',
    titulo: 'Rehabilitación — Día 120',
    desc: 'Gestionar Concepto de Rehabilitación ante la EPS',
    clase: 'border-warning/30 bg-warning/5',
    claseHeader: 'text-warning',
  },
  {
    nivel: 'preventiva',
    titulo: 'Preventiva — Día 90',
    desc: 'Monitorear acumulación de días para anticipar gestiones',
    clase: 'border-ok/30 bg-ok/5',
    claseHeader: 'text-ok',
  },
]

const UMBRALES = { critica: 180, afp: 150, rehabilitacion: 120, preventiva: 90 }
const ESTADOS_ACTIVOS = ['pendiente', 'transcrita', 'en_cobro']

export default function Alertas() {
  const navigate = useNavigate()
  const [grupos, setGrupos] = useState({ critica: [], afp: [], rehabilitacion: [], preventiva: [] })
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    getIncapacidades()
      .then((data) => {
        const activas = data.filter((i) => ESTADOS_ACTIVOS.includes(i.estado))
        const conAlerta = activas
          .map((i) => ({ ...i, dias: calcularDias(i.fecha_inicio, i.fecha_fin) }))
          .filter((i) => i.dias >= 90)

        const agrupadas = { critica: [], afp: [], rehabilitacion: [], preventiva: [] }
        for (const inc of conAlerta) {
          const { nivel } = calcularNivelAlerta(inc.dias)
          if (agrupadas[nivel]) agrupadas[nivel].push(inc)
        }

        // Ordenar cada grupo por días descendente (más urgente primero)
        for (const nivel of Object.keys(agrupadas)) {
          agrupadas[nivel].sort((a, b) => b.dias - a.dias)
        }

        setGrupos(agrupadas)
        setTotal(conAlerta.length)
      })
      .catch(() => toast.error('Error al cargar alertas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text">Alertas</h2>
        <p className="mt-1 text-sm text-muted">
          {total === 0
            ? 'No hay incapacidades activas en estado de alerta'
            : `${total} incapacidad${total !== 1 ? 'es' : ''} activa${total !== 1 ? 's' : ''} requieren atención`}
        </p>
      </div>

      {total === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ok/20">
            <span className="text-ok text-xl">✓</span>
          </div>
          <p className="font-medium text-text">Todo bajo control</p>
          <p className="mt-1 text-sm text-muted">Ninguna incapacidad supera los 90 días acumulados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {GRUPOS.map(({ nivel, titulo, desc, clase, claseHeader }) => {
            const items = grupos[nivel]
            if (items.length === 0) return null
            return (
              <div key={nivel} className={`rounded-xl border p-5 ${clase}`}>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${claseHeader}`}>{titulo}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${claseHeader} bg-current/10`}>
                      {items.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{desc}</p>
                </div>

                <div className="space-y-2">
                  {items.map((inc) => {
                    const fechaAccion = calcularFechaAccion(inc.fecha_inicio, nivel)
                    return (
                      <div
                        key={inc.id}
                        onClick={() => navigate(`/incapacidades/${inc.id}`)}
                        className="flex items-center gap-4 rounded-lg bg-surface/60 px-4 py-3 cursor-pointer hover:bg-surface transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg text-xs font-semibold text-muted">
                          {inc.colaboradores?.nombre?.split(' ').slice(0, 2).map((p) => p[0]).join('') ?? '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {inc.colaboradores?.nombre ?? '—'}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {inc.colaboradores?.area ?? '—'} · {inc.diagnostico ?? 'Sin diagnóstico'}
                          </p>
                        </div>

                        {/* Días */}
                        <div className="text-right flex-shrink-0">
                          <p className={`font-mono font-bold text-sm ${claseHeader}`}>{inc.dias} días</p>
                          {fechaAccion && (
                            <p className="text-xs text-muted">Acción: {fechaAccion}</p>
                          )}
                        </div>

                        {/* Estado */}
                        <div className="flex-shrink-0">
                          <StatusBadge estado={inc.estado} />
                        </div>

                        <span className="text-muted text-sm flex-shrink-0">→</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function calcularFechaAccion(fechaInicio, nivel) {
  if (!fechaInicio) return null
  const umbral = UMBRALES[nivel]
  if (!umbral) return null
  const fecha = new Date(fechaInicio)
  fecha.setDate(fecha.getDate() + umbral)
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
