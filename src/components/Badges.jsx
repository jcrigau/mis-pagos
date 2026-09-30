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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.fg}`}>
      <Icon name={meta.icon} className="text-sm" />
      {subtipo}
    </span>
  )
}

/** Ícono de subtipo: 56×56 con ícono de 32px sobre el color propio del subtipo. */
export function SubtipoAvatar({ subtipo }) {
  const meta = subtipoMeta(subtipo)
  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.bg} ${meta.fg}`}>
      <Icon name={meta.icon} className="text-[32px]" />
    </span>
  )
}
