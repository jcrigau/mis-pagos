import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { addRecord } from '../db'
import { today, toISODate } from '../lib/dates'
import { formatMoney } from '../lib/export'

export default function RegisterPaymentModal({ open, onClose, serie, onSaved }) {
  const [fecha, setFecha] = useState(toISODate(today()))
  const [importe, setImporte] = useState('')
  const [saving, setSaving] = useState(false)

  // Al abrir, precarga hoy + último importe conocido.
  useEffect(() => {
    if (open && serie) {
      setFecha(toISODate(today()))
      setImporte(serie.importeUltimo != null ? String(serie.importeUltimo) : '')
    }
  }, [open, serie])

  if (!serie) return null

  async function handleSave() {
    if (!importe || Number(importe) <= 0) return
    setSaving(true)
    await addRecord({ seriesId: serie.id, fechaPago: fecha, importe: Number(importe) })
    setSaving(false)
    onSaved?.()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:animate-scale-in">
          <DialogTitle className="text-lg font-bold">Registrar pago</DialogTitle>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{serie.nombre}</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="field" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="label">Importe</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0"
                className="field"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                autoFocus
              />
              {serie.importeUltimo != null && (
                <p className="mt-1.5 text-xs text-slate-400">Último: {formatMoney(serie.importeUltimo)}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn-secondary flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary flex-1" onClick={handleSave} disabled={saving || !importe}>
              Guardar pago
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
