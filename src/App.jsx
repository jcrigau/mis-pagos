import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { buildUpcoming } from './lib/pending'
import { isLocked } from './lib/pin'
import LockScreen from './components/LockScreen'
import BottomNav from './components/BottomNav'
import { AvisoVersionVieja, FranjaVersionVieja } from './components/VersionVieja'
import Home from './pages/Home'
import AddEditPayment from './pages/AddEditPayment'
import PaymentDetail from './pages/PaymentDetail'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  const [locked, setLocked] = useState(() => isLocked())
  // Sale cada vez que se abre la app: esta versión ya no se usa (ver VersionVieja.jsx).
  const [aviso, setAviso] = useState(true)
  const series = useLiveQuery(() => db.series.toArray(), [], [])
  const records = useLiveQuery(() => db.records.toArray(), [], [])
  const { overdueOrUrgent } = buildUpcoming(series, records)

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />
  if (aviso) return <AvisoVersionVieja onSeguir={() => { setAviso(false); window.scrollTo(0, 0) }} />

  return (
    <div className="mx-auto min-h-full max-w-lg pb-24">
      <FranjaVersionVieja />
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
