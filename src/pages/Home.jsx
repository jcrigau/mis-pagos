import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PaymentCard from '../components/PaymentCard'
import Icon from '../components/Icon'
import RegisterPaymentModal from '../components/RegisterPaymentModal'
import { buildUpcoming } from '../lib/pending'
import { formatFecha } from '../lib/dates'

export default function Home({ series, records }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [payFor, setPayFor] = useState(null)
  const { list } = useMemo(() => buildUpcoming(series, records), [series, records])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return list
    return list.filter((x) => x.serie.nombre.toLowerCase().includes(term))
  }, [list, q])

  const totalActivas = series.filter((s) => s.estado === 'activo').length

  return (
    <div>
      <PageHeader title="Próximos pagos" subtitle={formatFecha(new Date())} />

      <div className="space-y-3 p-4">
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

        {filtered.length === 0 ? (
          <EmptyState hasSeries={totalActivas > 0} onAdd={() => navigate('/agregar')} searching={!!q.trim()} />
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
