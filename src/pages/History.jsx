import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import ConfirmDialog from '../components/ConfirmDialog'
import { SubtipoBadge } from '../components/Badges'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { deleteRecord, updateRecord } from '../db'
import { TIPOS, SUBTIPOS, FORMAS_PAGO, formaPagoMeta } from '../lib/constants'
import { formatFecha } from '../lib/dates'
import { exportHistoryToExcel, formatMoney } from '../lib/export'

export default function History({ series, records }) {
  const [tipo, setTipo] = useState('')
  const [subtipo, setSubtipo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [estadoSerie, setEstadoSerie] = useState('')
  const [editRec, setEditRec] = useState(null)
  const [delRec, setDelRec] = useState(null)

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series])

  const rows = useMemo(() => {
    return records
      .map((r) => {
        const s = seriesById.get(r.seriesId)
        if (!s) return null
        return {
          ...r,
          nombre: s.nombre,
          tipo: s.tipo,
          subtipo: s.subtipo,
          notas: s.notas,
          estadoSerie: s.estado,
        }
      })
      .filter(Boolean)
      .filter((r) => (tipo ? r.tipo === tipo : true))
      .filter((r) => (subtipo ? r.subtipo === subtipo : true))
      .filter((r) => (estadoSerie ? r.estadoSerie === estadoSerie : true))
      .filter((r) => (desde ? r.fechaPago >= desde : true))
      .filter((r) => (hasta ? r.fechaPago <= hasta : true))
      .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
  }, [records, seriesById, tipo, subtipo, estadoSerie, desde, hasta])

  const total = rows.reduce((sum, r) => sum + Number(r.importe || 0), 0)
  const hasFilters = tipo || subtipo || desde || hasta || estadoSerie

  return (
    <div>
      <PageHeader
        title="Historial"
        subtitle={`${rows.length} pago(s) · ${formatMoney(total)}`}
        right={
          <button
            onClick={() => exportHistoryToExcel(rows)}
            disabled={rows.length === 0}
            className="flex h-10 items-center gap-1 rounded-full bg-brand px-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Icon name="download" className="text-lg" /> Excel
          </button>
        }
      />

      <div className="space-y-4 p-4">
        {/* Filtros */}
        <div className="card space-y-3">
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-500">
            <Icon name="filter_list" className="text-lg" /> Filtros
            {hasFilters && (
              <button
                onClick={() => {
                  setTipo('')
                  setSubtipo('')
                  setDesde('')
                  setHasta('')
                  setEstadoSerie('')
                }}
                className="ml-auto text-brand"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todo tipo</option>
              {TIPOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select className="field" value={subtipo} onChange={(e) => setSubtipo(e.target.value)}>
              <option value="">Todo subtipo</option>
              {SUBTIPOS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <label className="text-xs font-medium text-slate-400">
              Desde
              <input type="date" className="field mt-1" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-slate-400">
              Hasta
              <input type="date" className="field mt-1" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
            <select
              className="field col-span-2"
              value={estadoSerie}
              onChange={(e) => setEstadoSerie(e.target.value)}
            >
              <option value="">Series: todas</option>
              <option value="activo">Solo activas</option>
              <option value="suspendido">Solo suspendidas</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Icon name="receipt_long" className="text-5xl" />
            <p className="mt-2">Sin pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="card flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.nombre}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <SubtipoBadge subtipo={r.subtipo} />
                    <span className="text-xs text-slate-400">{formatFecha(r.fechaPago)}</span>
                    {r.formaPago && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Icon name={formaPagoMeta(r.formaPago)?.icon || 'more_horiz'} className="text-sm" />
                        {r.formaPago}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold tabular-nums">{formatMoney(r.importe)}</span>
                <div className="flex">
                  <button
                    onClick={() => setEditRec(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 active:bg-slate-200 dark:active:bg-slate-800"
                    aria-label="Editar"
                  >
                    <Icon name="edit" className="text-lg" />
                  </button>
                  <button
                    onClick={() => setDelRec(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-red-400 active:bg-red-100 dark:active:bg-red-500/20"
                    aria-label="Borrar"
                  >
                    <Icon name="delete" className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditRecordModal rec={editRec} onClose={() => setEditRec(null)} />
      <ConfirmDialog
        open={!!delRec}
        onClose={() => setDelRec(null)}
        onConfirm={() => delRec && deleteRecord(delRec.id)}
        title="Borrar registro"
        message="Se eliminará este pago del historial."
        confirmLabel="Borrar"
        danger
      />
    </div>
  )
}

function EditRecordModal({ rec, onClose }) {
  const [fecha, setFecha] = useState('')
  const [importe, setImporte] = useState('')
  const [formaPago, setFormaPago] = useState(null)

  // Sincroniza al abrir.
  useEffect(() => {
    if (rec) {
      setFecha(rec.fechaPago)
      setImporte(String(rec.importe))
      setFormaPago(rec.formaPago || null)
    }
  }, [rec])

  async function save() {
    await updateRecord(rec.id, { fechaPago: fecha, importe: Number(importe), formaPago })
    onClose()
  }

  return (
    <Dialog open={!!rec} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:animate-scale-in">
          <DialogTitle className="text-lg font-bold">Editar pago</DialogTitle>
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="field" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="label">Importe</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="field"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Forma de pago (opcional)</label>
              <div className="flex flex-wrap gap-2">
                {FORMAS_PAGO.map((f) => {
                  const active = formaPago === f.value
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormaPago(active ? null : f.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition active:scale-95 ${
                        active
                          ? 'border-brand bg-brand text-white'
                          : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon name={f.icon} className="text-base" />
                      {f.value}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-secondary flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary flex-1" onClick={save} disabled={!importe}>
              Guardar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
