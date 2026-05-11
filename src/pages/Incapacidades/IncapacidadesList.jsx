import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIncapacidades } from '../../services/incapacidades'
import { calcularDias } from '../../utils/calculadora'
import StatusBadge from '../../components/shared/StatusBadge'
import Semaforo from '../../components/shared/Semaforo'

const TIPOS_LABEL = {
  enfermedad_general:   'Enfermedad General',
  laboral:              'Accidente Laboral',
  accidente_transito:   'Acc. Tránsito',
  licencia:             'Licencia',
}

const ESTADOS = ['pendiente', 'transcrita', 'en_cobro', 'pagada', 'rechazada']
const TIPOS   = ['enfermedad_general', 'laboral', 'accidente_transito', 'licencia']

export default function IncapacidadesList() {
  const navigate = useNavigate()
  const [incapacidades, setIncapacidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  useEffect(() => {
    getIncapacidades()
      .then(setIncapacidades)
      .catch(() => toast.error('Error al cargar incapacidades'))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = incapacidades.filter((i) => {
    if (filtroEstado && i.estado !== filtroEstado) return false
    if (filtroTipo && i.tipo !== filtroTipo) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text">Incapacidades</h2>
          <p className="mt-1 text-sm text-muted">
            {filtradas.length} de {incapacidades.length} registro{incapacidades.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/incapacidades/nueva')} className="btn-primary">
          + Nueva incapacidad
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input-field w-44"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="input-field w-52"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
            ))}
          </select>

          {(filtroEstado || filtroTipo) && (
            <button
              onClick={() => { setFiltroEstado(''); setFiltroTipo('') }}
              className="text-sm text-muted hover:text-text transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {filtradas.length === 0 ? (
          <div className="py-12 text-center text-muted">
            {filtroEstado || filtroTipo ? 'Sin resultados con los filtros aplicados' : 'No hay incapacidades registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/10 text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">Colaborador</th>
                  <th className="pb-3 pr-4 font-medium">Tipo</th>
                  <th className="pb-3 pr-4 font-medium">Diagnóstico</th>
                  <th className="pb-3 pr-4 font-medium">Fecha inicio</th>
                  <th className="pb-3 pr-4 font-medium text-right">Días</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 pr-4 font-medium">Alerta</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {filtradas.map((i) => {
                  const dias = calcularDias(i.fecha_inicio, i.fecha_fin)
                  return (
                    <tr key={i.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-text">
                        {i.colaboradores?.nombre ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {TIPOS_LABEL[i.tipo] ?? i.tipo}
                      </td>
                      <td className="py-3 pr-4 text-text max-w-xs truncate">
                        {i.diagnostico ?? '—'}
                      </td>
                      <td className="py-3 pr-4 font-mono text-muted">
                        {i.fecha_inicio}
                      </td>
                      <td className="py-3 pr-4 font-mono text-text text-right">
                        {dias}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge estado={i.estado} />
                      </td>
                      <td className="py-3 pr-4">
                        <Semaforo dias={dias} mostrarLabel />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/incapacidades/${i.id}`)}
                            className="text-accent hover:text-accent-hover text-xs font-medium transition-colors"
                          >
                            Ver detalle
                          </button>
                          <button
                            onClick={() => navigate(`/incapacidades/${i.id}/editar`)}
                            className="text-muted hover:text-text text-xs font-medium transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
