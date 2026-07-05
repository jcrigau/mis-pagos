// Tipos y subtipos de pago, con íconos Material y emoji de respaldo.

export const TIPOS = ['Personal', 'Empresa']

export const SUBTIPOS = [
  'Tarjeta',
  'Salud',
  'Servicios',
  'Suscripciones',
  'Impuestos',
  'Expensas',
  'Laborales',
  'Otros',
]

// Ícono Material Icons Round + emoji fallback + color de acento por subtipo.
export const SUBTIPO_META = {
  Tarjeta: { icon: 'credit_card', emoji: '💳', color: 'text-violet-500' },
  Salud: { icon: 'local_hospital', emoji: '🏥', color: 'text-rose-500' },
  Servicios: { icon: 'build', emoji: '🔧', color: 'text-amber-500' },
  Suscripciones: { icon: 'notifications_active', emoji: '🔔', color: 'text-sky-500' },
  Impuestos: { icon: 'receipt_long', emoji: '📋', color: 'text-emerald-500' },
  Expensas: { icon: 'apartment', emoji: '🏢', color: 'text-orange-500' },
  Laborales: { icon: 'work', emoji: '💼', color: 'text-indigo-500' },
  Otros: { icon: 'push_pin', emoji: '📌', color: 'text-slate-500' },
}

export function subtipoMeta(subtipo) {
  return SUBTIPO_META[subtipo] || SUBTIPO_META.Otros
}

export const PERIODICIDADES = [
  { value: 1, label: 'Mensual' },
  { value: 2, label: 'Cada 2 meses' },
  { value: 3, label: 'Trimestral' },
  { value: 6, label: 'Semestral' },
  { value: 12, label: 'Anual' },
]

export function periodicidadLabel(value) {
  return PERIODICIDADES.find((p) => p.value === Number(value))?.label || `Cada ${value} meses`
}
