import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const TABS = [
  { to: '/', icon: 'home', label: 'Inicio', end: true },
  { to: '/agregar', icon: 'add_circle', label: 'Agregar' },
  { to: '/historial', icon: 'receipt_long', label: 'Historial' },
  { to: '/ajustes', icon: 'settings', label: 'Ajustes' },
]

export default function BottomNav({ badge = 0 }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <span className="relative">
              <Icon name={tab.icon} className="text-[26px]" />
              {tab.to === '/' && badge > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
