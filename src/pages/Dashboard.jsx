import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import toast from 'react-hot-toast'
import { getIncapacidades } from '../services/incapacidades'
import { calcularDias, calcularValorEstimado } from '../utils/calculadora'
import { calcularNivelAlerta } from '../utils/alertas'
import StatusBadge from '../components/shared/StatusBadge'
import Semaforo from '../components/shared/Semaforo'

const ESTADOS_ACTIVOS = ['pendiente', 'transcrita', 'en_cobro']

const COLOR_ESTADO = {
  pendiente:  '#7A8FA6',
  transcrita: '#60A5FA',
  en_cobro:   '#F4A261',
  pagada:     '#4CAF50',
  rechazada:  '#E63946',
}

const LABEL_ESTADO = {
  pendiente:  'Pendiente',
  transcrita: 'Transcrita',
  en_cobro:   'En cobro',
  pagada:     'Pagada',
  rechazada:  'Rechazada',
}

function cop(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(valor)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ activas: 0, valorCobro: 0, criticas: 0, cerradasMes: 0 })
  const [dataPie, setDataPie] = useState([])
  const [dataBarras, setDataBarras] = useState([])
  const [alertasTop, setAlertasTop] = useState([])

  useEffect(() => {
    getIncapacidades()
      .then((data) => {
        const enriquecidas = data.map((i) => ({
          ...i,
          dias: calcularDias(i.fecha_inicio, i.fecha_fin),
        }))

        // KPIs
        const activas = enriquecidas.filter((i) => ESTADOS_ACTIVOS.includes(i.estado))

        const valorCobro = enriquecidas
          .filter((i) => i.estado === 'en_cobro')
          .reduce((sum, i) => {
            const salario = i.colaboradores?.salario_base ?? 0
            if (!salario) return sum
            return sum + calcularValorEstimado(i.dias, salario).valorTotal
          }, 0)

        const criticas = activas.filter((i) => calcularNivelAlerta(i.dias).nivel === 'critica').length

        const ahora = new Date()
        const cerradasMes = enriquecidas.filter((i) => {
          if (!['pagada', 'rechazada'].includes(i.estado)) return false
          const fin = new Date(i.fecha_fin)
          return fin.getMonth() === ahora.getMonth() && fin.getFullYear() === ahora.getFullYear()
        }).length

        setKpis({ activas: activas.length, valorCobro, criticas, cerradasMes })

        // Gráfico de dona — distribución por estado
        const conteoEstados = {}
        for (const i of enriquecidas) {
          conteoEstados[i.estado] = (conteoEstados[i.estado] ?? 0) + 1
        }
        setDataPie(
          Object.entries(conteoEstados).map(([estado, cantidad]) => ({
            name: LABEL_ESTADO[estado] ?? estado,
            value: cantidad,
            color: COLOR_ESTADO[estado] ?? '#7A8FA6',
          }))
        )

        // Gráfico de barras — top 5 áreas por días de ausentismo
        const diasPorArea = {}
        for (const i of enriquecidas) {
          const area = i.colaboradores?.area ?? 'Sin área'
          diasPorArea[area] = (diasPorArea[area] ?? 0) + i.dias
        }
        setDataBarras(
          Object.entries(diasPorArea)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([area, dias]) => ({ area, dias }))
        )

        // Top 5 alertas más urgentes
        setAlertasTop(
          activas
            .filter((i) => i.dias >= 90)
            .sort((a, b) => b.dias - a.dias)
            .slice(0, 5)
        )
      })
      .catch(() => toast.error('Error al cargar el dashboard'))
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text">Dashboard</h2>
        <p className="mt-1 text-sm text-muted">Resumen general del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Incapacidades activas"
          valor={kpis.activas}
          sub="En gestión actualmente"
          color="text-accent"
        />
        <KpiCard
          label="Valor en cobro"
          valor={cop(kpis.valorCobro)}
          sub="Estimado pendiente por cobrar"
          color="text-warning"
          mono
        />
        <KpiCard
          label="Alertas críticas"
          valor={kpis.criticas}
          sub="Día 180+ sin resolución"
          color="text-danger"
        />
        <KpiCard
          label="Cerradas este mes"
          valor={kpis.cerradasMes}
          sub="Pagadas o rechazadas"
          color="text-ok"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-5 gap-4">
        {/* Dona — distribución por estado */}
        <div className="card col-span-2">
          <h3 className="mb-4 font-semibold text-text text-sm">Distribución por estado</h3>
          {dataPie.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dataPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1B2A3B', border: '1px solid rgba(122,143,166,0.2)', borderRadius: 8 }}
                  labelStyle={{ color: '#F0F4F8' }}
                  itemStyle={{ color: '#F0F4F8' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: '#7A8FA6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barras — top 5 áreas */}
        <div className="card col-span-3">
          <h3 className="mb-4 font-semibold text-text text-sm">Top 5 áreas por días de ausentismo</h3>
          {dataBarras.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataBarras} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(122,143,166,0.1)" />
                <XAxis
                  dataKey="area"
                  tick={{ fill: '#7A8FA6', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#7A8FA6', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#1B2A3B', border: '1px solid rgba(122,143,166,0.2)', borderRadius: 8 }}
                  labelStyle={{ color: '#F0F4F8' }}
                  itemStyle={{ color: '#00C896' }}
                  formatter={(v) => [`${v} días`, 'Ausentismo']}
                />
                <Bar dataKey="dias" fill="#00C896" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top 5 alertas urgentes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text text-sm">Alertas más urgentes</h3>
          <button
            onClick={() => navigate('/alertas')}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            Ver todas →
          </button>
        </div>

        {alertasTop.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-ok">
            <span>●</span>
            <span>No hay incapacidades activas en estado de alerta</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alertasTop.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate(`/incapacidades/${inc.id}`)}
                className="flex items-center gap-4 rounded-lg border border-muted/10 bg-bg px-4 py-3 cursor-pointer hover:border-accent/30 transition-colors"
              >
                <Semaforo dias={inc.dias} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {inc.colaboradores?.nombre ?? '—'}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {inc.colaboradores?.area ?? '—'} · {inc.diagnostico ?? 'Sin diagnóstico'}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-warning flex-shrink-0">
                  {inc.dias} días
                </span>
                <StatusBadge estado={inc.estado} />
                <span className="text-muted text-sm flex-shrink-0">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, valor, sub, color, mono }) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-muted mb-2">{label}</p>
      <p className={`text-2xl font-bold mb-1 ${color} ${mono ? 'font-mono text-xl' : ''}`}>
        {valor}
      </p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  )
}
