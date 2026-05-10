const ESTADOS = {
  pendiente:  { label: 'Pendiente',  clase: 'bg-muted/20 text-muted' },
  transcrita: { label: 'Transcrita', clase: 'bg-blue-500/20 text-blue-400' },
  en_cobro:   { label: 'En cobro',   clase: 'bg-warning/20 text-warning' },
  pagada:     { label: 'Pagada',     clase: 'bg-ok/20 text-ok' },
  rechazada:  { label: 'Rechazada',  clase: 'bg-danger/20 text-danger' },
}

export default function StatusBadge({ estado }) {
  const cfg = ESTADOS[estado] ?? ESTADOS.pendiente
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cfg.clase}`}>
      {cfg.label}
    </span>
  )
}
