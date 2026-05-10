import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/incapacidades', label: 'Incapacidades', icon: '⊞' },
  { to: '/colaboradores', label: 'Colaboradores', icon: '◉' },
  { to: '/alertas', label: 'Alertas', icon: '⚑' },
  { to: '/reportes', label: 'Reportes', icon: '⊟' },
]

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col bg-surface border-r border-muted/10 flex-shrink-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-muted/10">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">
          M
        </div>
        <span className="font-semibold text-text text-sm">MLC Soluciones</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted hover:text-text hover:bg-surface/50'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-muted/10">
        <p className="text-xs text-muted">v1.0.0</p>
      </div>
    </aside>
  )
}
