import { computeNextPending, dueStatus, daysUntil, today } from './dates'

/**
 * Construye la lista de próximos vencimientos para el Home.
 * Solo series activas; calcula el próximo pendiente on-the-fly (no genera
 * registros futuros) y filtra a una ventana de días.
 *
 * @returns { list, overdueOrUrgent } list ordenada por fecha ascendente.
 */
export function buildUpcoming(series = [], records = [], { windowDays = 90 } = {}) {
  const hoy = today()
  const recordsBySeries = new Map()
  for (const r of records) {
    if (!recordsBySeries.has(r.seriesId)) recordsBySeries.set(r.seriesId, [])
    recordsBySeries.get(r.seriesId).push(r)
  }

  const list = []
  for (const serie of series) {
    if (serie.estado !== 'activo') continue
    const due = computeNextPending(serie, recordsBySeries.get(serie.id) || [], hoy)
    const n = daysUntil(due, hoy)
    // Muestra vencidos (n < 0) y todo lo que caiga dentro de la ventana.
    if (n > windowDays) continue
    list.push({
      serie,
      due,
      days: n,
      status: dueStatus(due, hoy, serie.diasAntesNotificacion),
    })
  }

  list.sort((a, b) => a.due - b.due)
  const overdueOrUrgent = list.filter((x) => x.status !== 'lejano').length
  return { list, overdueOrUrgent }
}
