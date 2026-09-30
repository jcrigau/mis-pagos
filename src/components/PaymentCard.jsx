import Icon from './Icon'
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

export default function PaymentCard({ serie, due, status, onClick, onPay }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.lejano
  return (
    <div className={`card border ${s.ring} flex items-center gap-3`}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-start gap-3 text-left transition active:scale-[0.99]">
        <SubtipoAvatar subtipo={serie.subtipo} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug">{serie.nombre}</h3>
          {/* Si importe + estado no entran en una línea, el estado baja y queda a la derecha. */}
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <span className="text-base font-bold tabular-nums">{formatMoney(serie.importeUltimo)}</span>
            <span className={`ml-auto flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold ${s.text}`}>
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {relativeLabel(due)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <TipoBadge tipo={serie.tipo} />
            <SubtipoBadge subtipo={serie.subtipo} />
          </div>
        </div>
      </button>
      <button
        onClick={onPay}
        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition active:scale-95 dark:text-emerald-400"
        aria-label={`Registrar pago de ${serie.nombre}`}
      >
        <Icon name="paid" className="text-2xl" />
        <span className="text-[10px] font-bold">Pagar</span>
      </button>
    </div>
  )
}
