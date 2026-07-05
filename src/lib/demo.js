import { createSeries, addRecord } from '../db'
import { today, toISODate } from './dates'

// Carga un set de datos de ejemplo para probar la app rápidamente.
export async function seedDemoData() {
  const hoy = today()
  const dia = hoy.getDate()

  // Día de vencimiento relativo a hoy para que se vean distintos estados.
  const vencido = ((dia + 25) % 28) + 1 // cae "hace unos días"
  const urgente = ((dia % 28) + 1) // muy cercano
  const lejano = ((dia + 12) % 28) + 1

  const defs = [
    { nombre: 'Tarjeta de crédito', tipo: 'Personal', subtipo: 'Tarjeta', diaVencimiento: vencido, importeUltimo: 85000, periodicidad: 1, diasAntesNotificacion: 3, formaPago: 'TC Visa' },
    { nombre: 'Prepaga médica', tipo: 'Personal', subtipo: 'Salud', diaVencimiento: urgente, importeUltimo: 62000, periodicidad: 1, diasAntesNotificacion: 2, formaPago: 'Cta Bancaria' },
    { nombre: 'Netflix + Spotify', tipo: 'Personal', subtipo: 'Suscripciones', diaVencimiento: lejano, importeUltimo: 12000, periodicidad: 1, formaPago: 'TC Mastercard' },
    { nombre: 'Expensas oficina', tipo: 'Empresa', subtipo: 'Expensas', diaVencimiento: urgente, importeUltimo: 145000, periodicidad: 1, diasAntesNotificacion: 5, formaPago: 'Mercadopago' },
    { nombre: 'Monotributo', tipo: 'Empresa', subtipo: 'Impuestos', diaVencimiento: 20, importeUltimo: 38000, periodicidad: 1, formaPago: 'Efectivo' },
    { nombre: 'Seguro del auto', tipo: 'Personal', subtipo: 'Servicios', diaVencimiento: lejano, importeUltimo: 42000, periodicidad: 3, formaPago: 'Cta Bancaria' },
  ]

  for (const d of defs) {
    const { formaPago, ...serieDef } = d
    const serie = await createSeries({ ...serieDef, diaIdealPago: d.diaVencimiento, notas: '', estado: 'activo' })
    // Registro histórico del mes pasado para poblar el historial.
    const prev = new Date(hoy.getFullYear(), hoy.getMonth() - 1, Math.min(d.diaVencimiento, 28))
    await addRecord({ seriesId: serie.id, fechaPago: toISODate(prev), importe: d.importeUltimo, formaPago })
  }
}
