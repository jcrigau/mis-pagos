import Dexie from 'dexie'
import { subtipoPorNombre } from './lib/constants'

// Base de datos local (IndexedDB) — offline first, sin sync automática.
export const db = new Dexie('mis-pagos')

db.version(1).stores({
  // Índices declarados: id (pk), y campos por los que filtramos/ordenamos.
  series: 'id, nombre, tipo, subtipo, estado, updatedAt',
  records: 'id, seriesId, fechaPago, createdAt',
})

// v2: log de notificaciones ya mostradas (clave = seriesId|fechaVencimientoISO)
// para no volver a notificar el mismo vencimiento.
db.version(2).stores({
  series: 'id, nombre, tipo, subtipo, estado, updatedAt',
  records: 'id, seriesId, fechaPago, createdAt',
  notifLog: 'key, notifiedAt',
})

// v3: subtipos nuevos (Luz, Gas, Telefonía, Internet, Alquiler). Reasigna las
// series existentes según su nombre; las que no coinciden quedan igual.
db.version(3)
  .stores({
    series: 'id, nombre, tipo, subtipo, estado, updatedAt',
    records: 'id, seriesId, fechaPago, createdAt',
    notifLog: 'key, notifiedAt',
  })
  .upgrade((tx) =>
    tx
      .table('series')
      .toCollection()
      .modify((serie) => {
        const nuevo = subtipoPorNombre(serie.nombre)
        if (nuevo && nuevo !== serie.subtipo) serie.subtipo = nuevo
      })
  )

const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

// ---- PaymentSeries ----

export async function createSeries(data) {
  const now = Date.now()
  const serie = {
    id: uuid(),
    nombre: data.nombre.trim(),
    tipo: data.tipo,
    subtipo: data.subtipo,
    importeUltimo: data.importeUltimo ?? null,
    diaVencimiento: Number(data.diaVencimiento),
    diaIdealPago: Number(data.diaIdealPago || data.diaVencimiento),
    periodicidad: Number(data.periodicidad) || 1,
    diasAntesNotificacion: Number(data.diasAntesNotificacion) || 0,
    estado: data.estado || 'activo',
    notas: data.notas?.trim() || '',
    createdAt: now,
    updatedAt: now,
  }
  await db.series.add(serie)
  return serie
}

export async function updateSeries(id, patch) {
  await db.series.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteSeries(id) {
  // Borra la serie y todos sus registros de pago.
  await db.transaction('rw', db.series, db.records, async () => {
    await db.records.where('seriesId').equals(id).delete()
    await db.series.delete(id)
  })
}

// ---- PaymentRecord ----

export async function addRecord({ seriesId, fechaPago, importe, formaPago }) {
  const record = {
    id: uuid(),
    seriesId,
    fechaPago,
    importe: Number(importe),
    formaPago: formaPago || null,
    createdAt: Date.now(),
  }
  await db.transaction('rw', db.series, db.records, async () => {
    await db.records.add(record)
    // El último importe pagado sugiere el próximo.
    await db.series.update(seriesId, {
      importeUltimo: record.importe,
      updatedAt: Date.now(),
    })
  })
  return record
}

export async function updateRecord(id, patch) {
  await db.records.update(id, patch)
}

export async function deleteRecord(id) {
  await db.records.delete(id)
}

// ---- Backup / Restore ----

// v2: los subtipos ya incluyen la reasignación por nombre (ver db v3).
export const BACKUP_VERSION = 2

export async function exportAll() {
  const [series, records] = await Promise.all([db.series.toArray(), db.records.toArray()])
  return {
    app: 'mis-pagos',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    series,
    records,
  }
}

export async function importAll(data, { replace = true } = {}) {
  if (!data || data.app !== 'mis-pagos' || !Array.isArray(data.series)) {
    throw new Error('Archivo de backup inválido.')
  }
  if (Number(data.version) > BACKUP_VERSION) {
    throw new Error('El backup es de una versión más nueva de la app. Actualizá la app antes de importarlo.')
  }
  // Backups v1 (o sin versión): mismo remapeo de subtipos que la migración v3.
  const series =
    Number(data.version || 1) < 2
      ? data.series.map((s) => {
          const nuevo = subtipoPorNombre(s.nombre)
          return nuevo ? { ...s, subtipo: nuevo } : s
        })
      : data.series
  await db.transaction('rw', db.series, db.records, async () => {
    if (replace) {
      await db.series.clear()
      await db.records.clear()
    }
    await db.series.bulkPut(series)
    await db.records.bulkPut(data.records || [])
  })
}

export async function wipeAll() {
  await db.transaction('rw', db.series, db.records, async () => {
    await db.series.clear()
    await db.records.clear()
  })
}
