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
    'Forma de pago': f.formaPago || '',
    Notas: f.notas || '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 26 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 40 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos')
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(new Blob([out], { type: 'application/octet-stream' }), `payment-history-${toISODate(today())}.xlsx`)
}

// ---- Backup: descarga, compartir nativo y recordatorio ----

const BACKUP_AT_KEY = 'mp-last-backup'
const BACKUP_SNOOZE_KEY = 'mp-backup-snooze'

function backupFilename() {
  return `payment-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
}

function markBackupDone() {
  localStorage.setItem(BACKUP_AT_KEY, String(Date.now()))
}

/** Timestamp del último backup, o null si nunca se hizo. */
export function lastBackupAt() {
  const v = localStorage.getItem(BACKUP_AT_KEY)
  return v ? Number(v) : null
}

/** Pospone el aviso de backup por 7 días. */
export function snoozeBackupReminder() {
  localStorage.setItem(BACKUP_SNOOZE_KEY, String(Date.now()))
}

/** ¿Corresponde mostrar el aviso? (nunca hubo backup o pasaron 30+ días) */
export function backupReminderDue() {
  const snooze = Number(localStorage.getItem(BACKUP_SNOOZE_KEY) || 0)
  if (Date.now() - snooze < 7 * 86400000) return false
  const last = lastBackupAt()
  return !last || Date.now() - last > 30 * 86400000
}

/** Descarga el backup JSON completo. */
export function downloadBackup(data) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), backupFilename())
  markBackupDone()
}

/**
 * Comparte el backup por el menú nativo (Drive, Gmail, WhatsApp…).
 * Si el dispositivo no soporta compartir archivos, cae a la descarga.
 * @returns {'shared'|'downloaded'|'cancelled'}
 */
export async function shareBackup(data) {
  const file = new File([JSON.stringify(data, null, 2)], backupFilename(), { type: 'application/json' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Backup Mis Pagos' })
      markBackupDone()
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      // Si el share falla por otra razón, seguimos con la descarga.
    }
  }
  downloadBackup(data)
  return 'downloaded'
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
