import Icon from './Icon'
import { subtipoMeta } from '../lib/constants'

export function TipoBadge({ tipo }) {
  const isEmpresa = tipo === 'Empresa'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isEmpresa
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      }`}
    >
      <Icon name={isEmpresa ? 'business' : 'person'} className="text-sm" />
      {tipo}
    </span>
  )
}

export function SubtipoBadge({ subtipo }) {
  const meta = subtipoMeta(subtipo)
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Icon name={meta.icon} className={`text-sm ${meta.color}`} />
      {subtipo}
    </span>
  )
}

/** Ícono grande en círculo, usado en cards y detalle. */
export function SubtipoAvatar({ subtipo, size = 'md' }) {
  const meta = subtipoMeta(subtipo)
  const dim = size === 'lg' ? 'h-14 w-14 text-[30px]' : 'h-11 w-11 text-[22px]'
  return (
    <span className={`flex ${dim} shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800`}>
      <Icon name={meta.icon} className={meta.color} />
    </span>
  )
}
