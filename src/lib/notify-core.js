import { db } from '../db'
import { buildUpcoming } from './pending'
import { relativeLabel, toISODate } from './dates'
import { formatMoney } from './export'

/**
 * Revisa los vencimientos y muestra notificaciones para los que corresponden,
 * sin repetir (dedupe por seriesId|fechaVencimiento en notifLog).
 * Corre en el contexto del service worker (recibe su ServiceWorkerRegistration).
 *
 * Notifica cuando faltan `diasAntesNotificacion` días o menos (incluye vencidos
 * y el mismo día). Con diasAntes = 0, avisa el día del vencimiento y después.
 *
 * @returns {Promise<number>} cantidad de notificaciones mostradas
 */
export async function runNotificationCheck(registration) {
  if (!registration || typeof registration.showNotification !== 'function') return 0

  const [series, records] = await Promise.all([db.series.toArray(), db.records.toArray()])
  const { list } = buildUpcoming(series, records)

  const pendientes = list.filter(
    (x) => x.days <= Math.max(0, Number(x.serie.diasAntesNotificacion) || 0)
  )

  let shown = 0
  for (const item of pendientes) {
    const key = `${item.serie.id}|${toISODate(item.due)}`
    if (await db.notifLog.get(key)) continue

    const importe = item.serie.importeUltimo != null ? ` · ${formatMoney(item.serie.importeUltimo)}` : ''
    const icon = new URL('pwa-192x192.png', registration.scope).href
    await registration.showNotification(item.serie.nombre, {
      body: `${relativeLabel(item.due)}${importe}`,
      tag: key,
      icon,
      badge: icon,
      data: { url: registration.scope },
    })
    await db.notifLog.put({ key, notifiedAt: Date.now() })
    shown++
  }

  // Limpieza de logs viejos (> 180 días) para no crecer sin límite.
  const cutoff = Date.now() - 180 * 86400000
  await db.notifLog.where('notifiedAt').below(cutoff).delete()

  return shown
}
