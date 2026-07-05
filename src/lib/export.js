import { toISODate, today } from './dates'

/** Dispara la descarga de un Blob con el nombre indicado. */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Exporta el histórico de pagos a Excel.
 * Estructura: Nombre | Tipo | Subtipo | Fecha | Importe | Notas
 * @param {Array} filas  registros ya "enriquecidos" con datos de la serie
 */
export async function exportHistoryToExcel(filas) {
  // Carga diferida: xlsx es pesado, solo se trae al exportar.
  const XLSX = await import('xlsx')
  const data = filas.map((f) => ({
    Nombre: f.nombre,
    Tipo: f.tipo,
    Subtipo: f.subtipo,
    Fecha: f.fechaPago,
    Importe: f.importe,
    Notas: f.notas || '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 26 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 40 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos')
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(new Blob([out], { type: 'application/octet-stream' }), `payment-history-${toISODate(today())}.xlsx`)
}

/** Descarga el backup JSON completo. */
export function downloadBackup(data) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `payment-backup-${stamp}.json`)
}

/** Formatea un número como moneda (es-AR). */
export function formatMoney(n) {
  if (n === null || n === undefined || n === '') return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(n))
}
