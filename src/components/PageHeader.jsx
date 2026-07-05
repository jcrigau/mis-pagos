import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

export default function PageHeader({ title, subtitle, back = false, right = null }) {
  const navigate = useNavigate()
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-slate-50/85 px-4 py-3 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/85"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-200 dark:active:bg-slate-800"
          aria-label="Volver"
        >
          <Icon name="arrow_back_ios_new" className="text-xl" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold">{title}</h1>
        {subtitle && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
