import { SubtipoAvatar, TipoBadge, SubtipoBadge } from './Badges'
import { relativeLabel } from '../lib/dates'
import { formatMoney } from '../lib/export'

const STATUS_STYLES = {
  vencido: {
    ring: 'border-red-300 dark:border-red-500/40',
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
  urgente: {
    ring: 'border-amber-300 dark:border-amber-500/40',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  lejano: {
    ring: 'border-slate-200 dark:border-slate-800',
    dot: 'bg-slate-300 dark:bg-slate-600',
    text: 'text-slate-500 dark:text-slate-400',
  },
}

export default function PaymentCard({ serie, due, status, onClick }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.lejano
  return (
    <button
      onClick={onClick}
      className={`card w-full border ${s.ring} flex items-center gap-3 text-left transition active:scale-[0.99]`}
    >
      <SubtipoAvatar subtipo={serie.subtipo} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{serie.nombre}</h3>
          <span className="shrink-0 text-base font-bold tabular-nums">{formatMoney(serie.importeUltimo)}</span>
        </div>
        <div className={`mt-0.5 flex items-center gap-1.5 text-sm font-semibold ${s.text}`}>
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {relativeLabel(due)}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <TipoBadge tipo={serie.tipo} />
          <SubtipoBadge subtipo={serie.subtipo} />
        </div>
      </div>
    </button>
  )
}
