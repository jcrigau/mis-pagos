import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import Icon from './Icon'
import { formatFecha } from '../lib/dates'
import { formatMoney } from '../lib/export'

// Desde la 2.00 (22/10/2026) Mis Pagos anda en internet, con usuario y clave, y MedGuard lee
// de ahí. Esta versión (todo en el teléfono) queda publicada solo para sacar la copia: lo que
// se cargue acá no llega a ningún lado. El 04/11/2026 se cargaron pagos acá por error (v1.3.1).
export const NUEVA = 'https://apps.adnsanluis.com/agendapagos/'
const DESDE = new Date(2026, 9, 22).getTime()

/** Pantalla que sale cada vez que se abre la app: avisa y lista lo cargado acá desde el 22/10. */
export function AvisoVersionVieja({ onSeguir }) {
  const series = useLiveQuery(() => db.series.toArray(), [], [])
  const recientes = useLiveQuery(() => db.records.where('createdAt').aboveOrEqual(DESDE).toArray(), [], [])
  const nombre = Object.fromEntries(series.map((s) => [s.id, s.nombre]))
  const lista = [...recientes].sort((a, b) => (a.fechaPago || '').localeCompare(b.fechaPago || ''))

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-5 p-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10">
        <Icon name="warning" className="text-4xl text-red-600 dark:text-red-400" />
      </span>
      <h1 className="text-2xl font-extrabold leading-tight">Esta versión de Mis Pagos ya no se usa</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Desde el 22/10/2026 Mis Pagos está en internet y se entra con usuario y clave.{' '}
        <strong>Lo que cargues acá queda solo en este teléfono:</strong> no aparece en la versión nueva
        ni llega a MedGuard.
      </p>
      <a href={NUEVA} className="btn-primary w-full">
        Abrir la versión nueva
        <Icon name="open_in_new" />
      </a>

      {lista.length > 0 && (
        <div className="card border-red-500/40">
          <p className="font-semibold">
            {lista.length === 1
              ? 'Cargaste acá 1 pago después del 22/10/2026'
              : `Cargaste acá ${lista.length} pagos después del 22/10/2026`}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No llegaron a la versión nueva: cargalos de nuevo allá.
          </p>
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {lista.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{nombre[r.seriesId] || 'Pago recurrente borrado'}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    pagado el {r.fechaPago ? formatFecha(r.fechaPago) : '—'}
                    {r.formaPago ? ` · ${r.formaPago}` : ''}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatMoney(r.importe)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {lista.length > 0 ? 'Cuando los pases, ' : 'Para no confundirte, '}
        borrá este ícono del teléfono y agregá el de la versión nueva (en el navegador: menú → «Agregar a
        pantalla de inicio»).
      </p>
      <button type="button" className="btn-secondary w-full" onClick={onSeguir}>
        Seguir acá (solo para mirar o sacar una copia)
      </button>
    </div>
  )
}

/** Franja fija arriba de todas las pantallas, si igual se sigue usando. */
export function FranjaVersionVieja() {
  return (
    <a
      href={NUEVA}
      className="flex items-center gap-2 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
    >
      <Icon name="warning" className="text-xl" />
      <span className="flex-1">Versión vieja: lo que cargues acá no llega a ningún lado.</span>
      <span className="shrink-0 underline">Abrir la nueva</span>
    </a>
  )
}
