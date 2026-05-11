import { calcularNivelAlerta } from '../../utils/alertas'

const CONFIG = {
  normal:          { dot: 'bg-ok',      label: 'Normal' },
  preventiva:      { dot: 'bg-ok',      label: 'Preventiva' },
  rehabilitacion:  { dot: 'bg-warning', label: 'Rehabilitación' },
  afp:             { dot: 'bg-warning', label: 'Envío AFP' },
  critica:         { dot: 'bg-danger',  label: 'Crítica' },
}

export default function Semaforo({ dias, mostrarLabel = false }) {
  const { nivel } = calcularNivelAlerta(dias)
  const cfg = CONFIG[nivel]

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${cfg.dot} ${nivel === 'critica' ? 'animate-pulse' : ''}`} />
      {mostrarLabel && (
        <span className="text-xs text-muted">{cfg.label}</span>
      )}
    </span>
  )
}
