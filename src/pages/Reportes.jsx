import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getIncapacidades } from '../services/incapacidades'
import { calcularDias } from '../utils/calculadora'
import { exportarIncapacidades, exportarCSV } from '../utils/exportar'
import StatusBadge from '../components/shared/StatusBadge'

const ESTADOS = ['pendiente', 'transcrita', 'en_cobro', 'pagada', 'rechazada']
const TIPOS = ['enfermedad_general', 'laboral', 'accidente_transito', 'licencia']
const TIPOS_LABEL = {
  enfermedad_general:  'Enfermedad General',
  laboral:             'Accidente Laboral',
  accidente_transito:  'Acc. Tránsito',
  licencia:            'Licencia',
}

export default function Reportes() {
  const [incapacidades, setIncapacidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filtros, setFiltros] = useState({ estado: '', tipo: '', desde: '', hasta: '' })

  useEffect(() => {
    getIncapacidades()
      .then(setIncapacidades)
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = incapacidades.filter((i) => {
    if (filtros.estado && i.estado !== filtros.estado) return false
    if (filtros.tipo && i.tipo !== filtros.tipo) return false
    if (filtros.desde && i.fecha_inicio < filtros.desde) return false
    if (filtros.hasta && i.fecha_inicio > filtros.hasta) return false
    return true
  })

  function setFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }))
  }

  function limpiar() {
    setFiltros({ estado: '', tipo: '', desde: '', hasta: '' })
  }

  async function handleExport(tipo) {
    setExporting(true)
    try {
      if (tipo === 'xlsx') {
        await exportarIncapacidades(filtros)
        toast.success('Archivo Excel descargado')
      } else {
        await exportarCSV(filtros)
        toast.success('Archivo CSV descargado')
      }
    } catch {
      toast.error('Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  const hayFiltros = filtros.estado || filtros.tipo || filtros.desde || filtros.hasta

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text">Reportes</h2>
        <p className="mt-1 text-sm text-muted">Exporta incapacidades filtradas a Excel o CSV</p>
      </div>

      {/* Filtros */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-text">Filtros de exportación</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltro('estado', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltro('tipo', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Fecha inicio desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => setFiltro('desde', e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Fecha inicio hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => setFiltro('hasta', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {hayFiltros && (
          <button
            onClick={limpiar}
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resumen + Botones */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? 'Cargando…' : `${filtradas.length} registro${filtradas.length !== 1 ? 's' : ''} seleccionado${filtradas.length !== 1 ? 's' : ''}`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting || filtradas.length === 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting || filtradas.length === 0}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exportando…' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* Vista previa */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-text">Vista previa</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            {hayFiltros ? 'Sin resultados con los filtros aplicados' : 'No hay incapacidades registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/10 text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">Colaborador</th>
                  <th className="pb-3 pr-4 font-medium">Cédula</th>
                  <th className="pb-3 pr-4 font-medium">Área</th>
                  <th className="pb-3 pr-4 font-medium">Tipo</th>
                  <th className="pb-3 pr-4 font-medium">Fecha inicio</th>
                  <th className="pb-3 pr-4 font-medium text-right">Días</th>
                  <th className="pb-3 font-medium">Estado</th>
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
                      <td className="py-3 pr-4 font-mono text-muted">
                        {i.colaboradores?.cedula ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {i.colaboradores?.area ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {TIPOS_LABEL[i.tipo] ?? i.tipo}
                      </td>
                      <td className="py-3 pr-4 font-mono text-muted">
                        {i.fecha_inicio}
                      </td>
                      <td className="py-3 pr-4 font-mono text-text text-right">
                        {dias}
                      </td>
                      <td className="py-3">
                        <StatusBadge estado={i.estado} />
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
