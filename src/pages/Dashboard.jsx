export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text mb-6">Dashboard</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['Incapacidades activas', 'Valor pendiente', 'Alertas críticas', 'Cerradas este mes'].map((label) => (
          <div key={label} className="card">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-mono font-semibold text-text mt-1">—</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">Los KPIs y gráficos se implementan en la Tarea 3.2</p>
    </div>
  )
}
