import { NavLink } from 'react-router'
import { CalendarIcon, ChartIcon, HomeIcon, ListIcon, SettingsIcon, WalletIcon } from './icons'

const links = [
  { to: '/', label: 'Inicio', icon: HomeIcon, end: true },
  { to: '/pagos', label: 'Pagos', icon: WalletIcon, end: false },
  { to: '/calendario', label: 'Calendario', icon: CalendarIcon, end: false },
  { to: '/gastos', label: 'Gastos', icon: ListIcon, end: false }, // también activo en /gastos/nuevo y /editar
  { to: '/analisis', label: 'Análisis', icon: ChartIcon, end: false },
  { to: '/configuracion', label: 'Configuración', icon: SettingsIcon, end: false },
]

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-950 text-gray-200 flex flex-col p-3">
      <div className="flex items-center gap-2 px-3 mb-6">
        {/* Mismo ícono que la pestaña del navegador (public/favicon.svg) */}
        <img src="/favicon.svg" alt="" className="h-8 w-8" />
        <span className="font-semibold">Gastos fijos</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 pt-3 px-3 text-sm">Gonzalo</div>
    </aside>
  )
}
