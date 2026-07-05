import { Routes, Route } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { buildUpcoming } from './lib/pending'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import AddEditPayment from './pages/AddEditPayment'
import PaymentDetail from './pages/PaymentDetail'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  const series = useLiveQuery(() => db.series.toArray(), [], [])
  const records = useLiveQuery(() => db.records.toArray(), [], [])
  const { overdueOrUrgent } = buildUpcoming(series, records)

  return (
    <div className="mx-auto min-h-full max-w-lg pb-24">
      <Routes>
        <Route path="/" element={<Home series={series} records={records} />} />
        <Route path="/agregar" element={<AddEditPayment />} />
        <Route path="/editar/:id" element={<AddEditPayment />} />
        <Route path="/pago/:id" element={<PaymentDetail series={series} records={records} />} />
        <Route path="/historial" element={<History series={series} records={records} />} />
        <Route path="/ajustes" element={<Settings />} />
      </Routes>
      <BottomNav badge={overdueOrUrgent} />
    </div>
  )
}
