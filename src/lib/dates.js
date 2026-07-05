// Utilidades de fecha (sin librerías externas: todo Date nativo, hora local).

/** Hoy a medianoche local. */
export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Date -> "YYYY-MM-DD" (local). */
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "YYYY-MM-DD" -> Date local a medianoche. */
export function fromISODate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Formato legible corto: "15 feb 2026". */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export function formatFecha(date) {
  const d = typeof date === 'string' ? fromISODate(date) : date
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Construye la fecha de vencimiento de un ciclo dado su índice de mes global
 * (año*12 + mes) y el día deseado, recortando al último día del mes si no existe
 * (ej: día 31 en febrero -> 28/29).
 */
export function buildDueDate(monthIndex, diaDeseado) {
  const y = Math.floor(monthIndex / 12)
  const m = monthIndex % 12
  const lastDay = new Date(y, m + 1, 0).getDate()
  const day = Math.min(Number(diaDeseado), lastDay)
  return new Date(y, m, day)
}

/**
 * Calcula el próximo vencimiento PENDIENTE de una serie:
 *  - Ancla la periodicidad al mes de creación (ciclos deterministas para
 *    periodicidad > 1).
 *  - Toma el ciclo alineado más reciente cuyo mes es <= mes actual (el "ciclo
 *    en curso"), que puede estar vencido si aún no se pagó.
 *  - Avanza de a `periodicidad` meses saltando los ciclos que ya tienen un
 *    PaymentRecord en su mes/año.
 *
 * @param {object} serie
 * @param {Array}  records  registros de pago de ESA serie
 * @param {Date}   hoy
 * @returns {Date} fecha del próximo vencimiento pendiente
 */
export function computeNextPending(serie, records = [], hoy = today()) {
  const p = Number(serie.periodicidad) || 1
  const created = new Date(serie.createdAt || Date.now())
  const anchorIndex = created.getFullYear() * 12 + created.getMonth()
  const hoyIndex = hoy.getFullYear() * 12 + hoy.getMonth()

  // Índice de ciclo alineado más reciente que sea <= mes actual.
  let currentIdx = hoyIndex - (((hoyIndex - anchorIndex) % p) + p) % p
  if (currentIdx < anchorIndex) currentIdx = anchorIndex

  const recordCoversCycle = (idx) => {
    const y = Math.floor(idx / 12)
    const m = idx % 12
    return records.some((r) => {
      const d = fromISODate(r.fechaPago)
      return d.getFullYear() === y && d.getMonth() === m
    })
  }

  let idx = currentIdx
  let guard = 0
  while (recordCoversCycle(idx) && guard < 600) {
    idx += p
    guard++
  }
  return buildDueDate(idx, serie.diaVencimiento)
}

/** Diferencia en días enteros entre due y hoy (ambos a medianoche). */
export function daysUntil(due, hoy = today()) {
  return Math.round((due.getTime() - hoy.getTime()) / 86400000)
}

/** Etiqueta relativa: "Hoy", "Mañana", "En 5 días", "Vencido hace 3 días". */
export function relativeLabel(due, hoy = today()) {
  const n = daysUntil(due, hoy)
  if (n === 0) return 'Hoy'
  if (n === 1) return 'Mañana'
  if (n === -1) return 'Vencido ayer'
  if (n > 1) return `En ${n} días`
  return `Vencido hace ${Math.abs(n)} días`
}

/**
 * Estado visual del vencimiento.
 * Considera `diasAntesNotificacion`: si estamos dentro de esa ventana, se marca
 * como urgente aunque falten más de 3 días.
 * @returns {'vencido'|'urgente'|'lejano'}
 */
export function dueStatus(due, hoy = today(), diasAntes = 0) {
  const n = daysUntil(due, hoy)
  if (n < 0) return 'vencido'
  if (n < 3 || n <= Number(diasAntes || 0)) return 'urgente'
  return 'lejano'
}
