import { useAuth } from '../../context/AuthContext'

const ROL_LABELS = {
  administrador: { label: 'Administrador', class: 'bg-accent/20 text-accent' },
  analista: { label: 'Analista', class: 'bg-muted/20 text-muted' },
}

export default function Navbar() {
  const { perfil, signOut } = useAuth()
  const rol = ROL_LABELS[perfil?.rol] ?? ROL_LABELS.analista

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-surface border-b border-muted/10 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        {perfil && (
          <>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${rol.class}`}>
              {rol.label}
            </span>
            <span className="text-sm text-text">{perfil.nombre}</span>
          </>
        )}
        <button
          onClick={signOut}
          className="text-sm text-muted hover:text-danger transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
