import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PaymentCard from '../components/PaymentCard'
import Icon from '../components/Icon'
import RegisterPaymentModal from '../components/RegisterPaymentModal'
import { buildUpcoming } from '../lib/pending'
import { SUBTIPOS, subtipoMeta } from '../lib/constants'
import { formatFecha } from '../lib/dates'
import { exportAll } from '../db'
import { shareBackup, backupReminderDue, snoozeBackupReminder, lastBackupAt } from '../lib/export'

const FILTERS_KEY = 'mp-home-filters'
const TIPO_CHIPS = [
  { value: '', label: 'Todos', icon: 'apps' },
  { value: 'Personal', label: 'Personal', icon: 'person' },
  { value: 'Empresa', label: 'Empresa', icon: 'business' },
]

function loadFilters() {
  try {
    const f = JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}')
    return {
      tipo: typeof f.tipo === 'string' ? f.tipo : '',
      subtipos: Array.isArray(f.subtipos) ? f.subtipos.filter((x) => typeof x === 'string') : [],
    }
  } catch {
    return { tipo: '', subtipos: [] }
  }
}

export default function Home({ series, records }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState(loadFilters)
  const [payFor, setPayFor] = useState(null)
  const [showBackupHint, setShowBackupHint] = useState(() => backupReminderDue())
  const { list } = useMemo(() => buildUpcoming(series, records), [series, records])

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
    } catch {
      // Sin storage disponible: los filtros solo duran la sesión.
    }
  }, [filters])

  const activas = useMemo(() => series.filter((s) => s.estado === 'activo'), [series])
  const totalActivas = activas.length

  // Chips de subtipo: los que tienen al menos una serie activa (dentro del tipo elegido).
  const subtiposDisponibles = useMemo(() => {
    const usados = new Set(activas.filter((s) => !filters.tipo || s.tipo === filters.tipo).map((s) => s.subtipo))
    const conocidos = SUBTIPOS.filter((st) => usados.has(st))
    const extra = [...usados].filter((st) => !SUBTIPOS.includes(st)).sort()
    return [...conocidos, ...extra]
  }, [activas, filters.tipo])

  // Un subtipo guardado que ya no tiene series activas no debe filtrar "a ciegas".
  const subtiposActivos = useMemo(
    () => filters.subtipos.filter((st) => subtiposDisponibles.includes(st)),
    [filters.subtipos, subtiposDisponibles]
  )

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const subs = new Set(subtiposActivos)
    return list.filter(
      (x) =>
        (!filters.tipo || x.serie.tipo === filters.tipo) &&
        (subs.size === 0 || subs.has(x.serie.subtipo)) &&
        (!term || x.serie.nombre.toLowerCase().includes(term))
    )
  }, [list, q, filters.tipo, subtiposActivos])

  const filtering = !!q.trim() || !!filters.tipo || subtiposActivos.length > 0

  const setTipo = (tipo) => setFilters((f) => ({ ...f, tipo }))
  const toggleSubtipo = (st) =>
    setFilters((f) => ({
      ...f,
      subtipos: f.subtipos.includes(st) ? f.subtipos.filter((x) => x !== st) : [...f.subtipos, st],
    }))

  return (
    <div>
      <PageHeader title="Próximos pagos" subtitle={formatFecha(new Date())} />

      <div className="space-y-3 p-4">
        {showBackupHint && series.length > 0 && (
          <BackupHint
            onDone={() => setShowBackupHint(false)}
            onDismiss={() => {
              snoozeBackupReminder()
              setShowBackupHint(false)
            }}
          />
        )}

        {totalActivas > 0 && (
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar pago…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="field pl-11"
            />
          </div>
        )}

        {totalActivas > 0 && (
          <div className="-mx-4 space-y-2">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
              {TIPO_CHIPS.map((c) => (
                <Chip key={c.label} active={filters.tipo === c.value} onClick={() => setTipo(c.value)} icon={c.icon}>
                  {c.label}
                </Chip>
              ))}
            </div>
            {subtiposDisponibles.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
                {subtiposDisponibles.map((st) => {
                  const meta = subtipoMeta(st)
                  return (
                    <Chip
                      key={st}
                      active={subtiposActivos.includes(st)}
                      onClick={() => toggleSubtipo(st)}
                      icon={meta.icon}
                      tint={`${meta.bg} ${meta.fg}`}
                    >
                      {st}
                    </Chip>
                  )
                })}
              </div>
            )}
            <p className="px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {filtered.length} {filtered.length === 1 ? 'pago' : 'pagos'}
            </p>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState hasSeries={totalActivas > 0} onAdd={() => navigate('/agregar')} searching={filtering} />
        ) : (
          filtered.map((item) => (
            <PaymentCard
              key={item.serie.id}
              serie={item.serie}
              due={item.due}
              status={item.status}
              onClick={() => navigate(`/pago/${item.serie.id}`)}
              onPay={() => setPayFor(item.serie)}
            />
          ))
        )}
      </div>

      <RegisterPaymentModal open={!!payFor} onClose={() => setPayFor(null)} serie={payFor} />
    </div>
  )
}

/**
 * Chip de filtro. Sin `tint`: activo = brand. Con `tint` (color del subtipo):
 * siempre lleva su color; activo se marca con borde en el color del texto.
 */
function Chip({ active, onClick, icon, tint, children }) {
  const base =
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition active:scale-95'
  const style = tint
    ? `${tint} ${active ? 'border-current' : 'border-transparent opacity-80'}`
    : active
      ? 'border-brand bg-brand text-white'
      : 'border-transparent bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`${base} ${style}`}>
      <Icon name={icon} className="text-lg" />
      {children}
      {tint && active && <Icon name="check" className="text-base" />}
    </button>
  )
}

function BackupHint({ onDone, onDismiss }) {
  const last = lastBackupAt()
  const dias = last ? Math.floor((Date.now() - last) / 86400000) : null

  async function handleBackup() {
    const res = await shareBackup(await exportAll())
    if (res !== 'cancelled') onDone()
  }

  return (
    <div className="card flex items-center gap-3 border-amber-300 bg-amber-500/5 dark:border-amber-500/40">
      <Icon name="cloud_upload" className="shrink-0 text-2xl text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {last ? `Último backup hace ${dias} días` : 'Nunca hiciste un backup'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Tus datos viven solo en este dispositivo.</p>
      </div>
      <button onClick={handleBackup} className="shrink-0 rounded-full bg-amber-500 px-3 py-2 text-xs font-bold text-white active:scale-95">
        Hacer backup
      </button>
      <button onClick={onDismiss} aria-label="Posponer aviso" className="shrink-0 p-1 text-slate-400">
        <Icon name="close" className="text-lg" />
      </button>
    </div>
  )
}

function EmptyState({ hasSeries, onAdd, searching }) {
  if (searching) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Icon name="search_off" className="text-5xl" />
        <p className="mt-2">Sin resultados</p>
      </div>
    )
  }
  return (
    <div className="py-16 text-center">
      <Icon name={hasSeries ? 'task_alt' : 'account_balance_wallet'} className="text-6xl text-slate-300 dark:text-slate-700" />
      <p className="mt-3 text-lg font-semibold">{hasSeries ? '¡Todo al día!' : 'Sin pagos aún'}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        {hasSeries ? 'No hay vencimientos en los próximos 90 días.' : 'Agregá tu primer recordatorio de pago.'}
      </p>
      {!hasSeries && (
        <button className="btn-primary mx-auto mt-6" onClick={onAdd}>
          <Icon name="add" /> Agregar pago
        </button>
      )}
    </div>
  )
}
