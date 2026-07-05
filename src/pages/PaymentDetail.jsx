import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { SubtipoAvatar, TipoBadge, SubtipoBadge } from '../components/Badges'
import RegisterPaymentModal from '../components/RegisterPaymentModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { deleteSeries, updateSeries } from '../db'
import { computeNextPending, relativeLabel, formatFecha, dueStatus } from '../lib/dates'
import { periodicidadLabel } from '../lib/constants'
import { formatMoney } from '../lib/export'

const STATUS_TEXT = {
  vencido: 'text-red-600 dark:text-red-400',
  urgente: 'text-amber-600 dark:text-amber-400',
  lejano: 'text-slate-500 dark:text-slate-400',
}

export default function PaymentDetail({ series, records }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payOpen, setPayOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const serie = series.find((s) => s.id === id)
  const serieRecords = useMemo(
    () => records.filter((r) => r.seriesId === id).sort((a, b) => b.fechaPago.localeCompare(a.fechaPago)),
    [records, id]
  )

  if (series.length && !serie) {
    return (
      <div>
        <PageHeader title="Pago" back />
        <p className="p-8 text-center text-slate-500">Este pago ya no existe.</p>
      </div>
    )
  }
  if (!serie) return <div className="p-8" />

  const due = computeNextPending(serie, serieRecords)
  const status = dueStatus(due, undefined, serie.diasAntesNotificacion)
  const suspendido = serie.estado === 'suspendido'

  async function toggleEstado() {
    await updateSeries(id, { estado: suspendido ? 'activo' : 'suspendido' })
  }

  async function handleDelete() {
    await deleteSeries(id)
    navigate('/', { replace: true })
  }

  return (
    <div>
      <PageHeader
        title={serie.nombre}
        back
        right={
          <button
            onClick={() => navigate(`/editar/${id}`)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand active:bg-slate-200 dark:active:bg-slate-800"
            aria-label="Editar"
          >
            <Icon name="edit" />
          </button>
        }
      />

      <div className="space-y-4 p-4">
        <div className="card flex items-center gap-4">
          <SubtipoAvatar subtipo={serie.subtipo} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              <TipoBadge tipo={serie.tipo} />
              <SubtipoBadge subtipo={serie.subtipo} />
            </div>
            {suspendido && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Icon name="pause_circle" className="text-sm" /> Suspendido
              </span>
            )}
          </div>
        </div>

        <div className="card space-y-3">
          <Row label="Próximo vencimiento" value={formatFecha(due)} accent={STATUS_TEXT[status]} />
          <Row label="Estado" value={relativeLabel(due)} accent={STATUS_TEXT[status]} />
          <Row label="Importe estimado" value={formatMoney(serie.importeUltimo)} />
          <Row label="Periodicidad" value={periodicidadLabel(serie.periodicidad)} />
          <Row label="Día de vencimiento" value={`Día ${serie.diaVencimiento}`} />
          <Row label="Día ideal de pago" value={`Día ${serie.diaIdealPago}`} />
          {serie.diasAntesNotificacion > 0 && (
            <Row label="Aviso anticipado" value={`${serie.diasAntesNotificacion} día(s) antes`} />
          )}
          {serie.notas && <Row label="Notas" value={serie.notas} />}
        </div>

        {!suspendido && (
          <button className="btn-primary w-full" onClick={() => setPayOpen(true)}>
            <Icon name="paid" /> Registrar pago
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary" onClick={toggleEstado}>
            <Icon name={suspendido ? 'play_arrow' : 'pause'} />
            {suspendido ? 'Reactivar' : 'Suspender'}
          </button>
          <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
            <Icon name="delete" /> Eliminar
          </button>
        </div>

        {serieRecords.length > 0 && (
          <div>
            <h2 className="mb-2 mt-4 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Historial ({serieRecords.length})
            </h2>
            <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
              {serieRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatFecha(r.fechaPago)}</span>
                  <span className="font-semibold tabular-nums">{formatMoney(r.importe)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <RegisterPaymentModal open={payOpen} onClose={() => setPayOpen(false)} serie={serie} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar pago"
        message={`Se borrará "${serie.nombre}" y sus ${serieRecords.length} registro(s). No se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-right font-semibold ${accent || ''}`}>{value}</span>
    </div>
  )
}
