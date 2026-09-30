// Tipos y subtipos de pago, con íconos Material Symbols y color propio.

export const TIPOS = ['Personal', 'Empresa']

export const SUBTIPOS = [
  'Luz',
  'Gas',
  'Telefonía',
  'Internet',
  'Alquiler',
  'Tarjeta',
  'Salud',
  'Servicios',
  'Suscripciones',
  'Impuestos',
  'Expensas',
  'Vehículo',
  'Educación',
  'Préstamos',
  'Laborales',
  'Otros',
]

// Ícono Material Symbols Rounded + emoji fallback + color por subtipo.
// `fg` = color del ícono, `bg` = fondo tintado (avatar y chip). Las clases
// van completas y literales para que Tailwind las detecte.
export const SUBTIPO_META = {
  Luz: { icon: 'lightbulb', emoji: '💡', fg: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-400/20' },
  Gas: { icon: 'local_fire_department', emoji: '🔥', fg: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/15' },
  Telefonía: { icon: 'call', emoji: '📞', fg: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/15' },
  Internet: { icon: 'wifi', emoji: '🌐', fg: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/15' },
  Alquiler: { icon: 'home', emoji: '🏠', fg: 'text-amber-800 dark:text-amber-600', bg: 'bg-amber-800/20' },
  Tarjeta: { icon: 'credit_card', emoji: '💳', fg: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/15' },
  Expensas: { icon: 'apartment', emoji: '🏢', fg: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-700/15' },
  Impuestos: { icon: 'account_balance', emoji: '🏛️', fg: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/15' },
  Laborales: { icon: 'work', emoji: '💼', fg: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/15' },
  Salud: { icon: 'medical_services', emoji: '🏥', fg: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-500/15' },
  Otros: { icon: 'category', emoji: '📌', fg: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/15' },
  // Subtipos sin color especificado: tonos que no chocan con los anteriores.
  Servicios: { icon: 'bolt', emoji: '⚡', fg: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-500/15' },
  Suscripciones: { icon: 'subscriptions', emoji: '🔔', fg: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/15' },
  Vehículo: { icon: 'directions_car', emoji: '🚗', fg: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/15' },
  Educación: { icon: 'school', emoji: '🎓', fg: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-500/15' },
  Préstamos: { icon: 'request_quote', emoji: '💰', fg: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15' },
}

export function subtipoMeta(subtipo) {
  return SUBTIPO_META[subtipo] || SUBTIPO_META.Otros
}

// Reasignación de subtipo por nombre (case-insensitive, "contiene").
// Usada por la migración de Dexie v3 y al importar backups JSON v1.
// El orden importa: gana la primera regla que coincide.
const SUBTIPO_RULES = [
  { subtipo: 'Luz', match: ['edesal', 'edesur', 'energía', 'energia'] },
  { subtipo: 'Gas', match: ['eco gas', 'ecogas'] },
  { subtipo: 'Telefonía', match: ['claro', 'personal maipu'] },
  { subtipo: 'Internet', match: ['megacable'] },
  { subtipo: 'Alquiler', match: ['alquiler'] },
]

/** Devuelve el subtipo que corresponde por nombre, o null si ninguna regla aplica. */
export function subtipoPorNombre(nombre) {
  const n = String(nombre || '').toLowerCase()
  return SUBTIPO_RULES.find((r) => r.match.some((m) => n.includes(m)))?.subtipo || null
}

// Formas de pago (opcional, por cada registro de pago puntual).
export const FORMAS_PAGO = [
  { value: 'Efectivo', icon: 'payments' },
  { value: 'Cta Bancaria', icon: 'account_balance' },
  { value: 'TC Visa', icon: 'credit_card' },
  { value: 'TC Mastercard', icon: 'credit_card' },
  { value: 'Mercadopago', icon: 'account_balance_wallet' },
  { value: 'Otros', icon: 'more_horiz' },
]

export function formaPagoMeta(value) {
  return FORMAS_PAGO.find((f) => f.value === value) || null
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
