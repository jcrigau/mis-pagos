import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import ConfirmDialog from '../components/ConfirmDialog'
import { useTheme } from '../hooks/useTheme'
import { db, exportAll, importAll, wipeAll } from '../db'
import { downloadBackup, shareBackup, lastBackupAt, formatMoney } from '../lib/export'
import { seedDemoData } from '../lib/demo'
import {
  notifSupported,
  notifPermission,
  notifEnabled,
  enableNotifications,
  disableNotifications,
} from '../lib/notifications'
import { hasPin, setPin, clearPin } from '../lib/pin'
import PinDialog from '../components/PinDialog'
import { formatFecha } from '../lib/dates'

const APP_VERSION = '1.2.0'

export default function Settings() {
  const { isDark, toggle } = useTheme()
  const fileRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [confirmDemo, setConfirmDemo] = useState(false)
  const [msg, setMsg] = useState('')
  const [notifOn, setNotifOn] = useState(notifEnabled())
  const [notifPerm, setNotifPerm] = useState(notifPermission())
  const [pinOn, setPinOn] = useState(hasPin())
  const [pinDialog, setPinDialog] = useState(null) // 'set' | 'verify' | null
  const [lastBackup, setLastBackup] = useState(lastBackupAt())

  const records = useLiveQuery(() => db.records.toArray(), [], [])
  const seriesCount = useLiveQuery(() => db.series.count(), [], 0)

  const year = new Date().getFullYear()
  const gastadoAnio = records
    .filter((r) => r.fechaPago?.startsWith(String(year)))
    .reduce((sum, r) => sum + Number(r.importe || 0), 0)

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  async function handleBackup() {
    downloadBackup(await exportAll())
    setLastBackup(lastBackupAt())
    flash('Backup descargado')
  }

  async function handleShareBackup() {
    const res = await shareBackup(await exportAll())
    setLastBackup(lastBackupAt())
    if (res === 'shared') flash('Backup compartido')
    else if (res === 'downloaded') flash('Compartir no disponible: se descargó')
  }

  async function toggleNotif() {
    if (notifOn) {
      await disableNotifications()
      setNotifOn(false)
      flash('Notificaciones desactivadas')
    } else {
      const res = await enableNotifications()
      setNotifPerm(notifPermission())
      if (res === 'granted') {
        setNotifOn(true)
        flash('Notificaciones activadas')
      } else if (res === 'denied') {
        flash('Permiso bloqueado: activalo en el navegador')
      } else if (res === 'unsupported') {
        flash('Este dispositivo no soporta notificaciones')
      } else {
        flash('No se concedió el permiso')
      }
    }
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setPendingImport(JSON.parse(reader.result))
      } catch {
        flash('Archivo inválido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function doImport() {
    try {
      await importAll(pendingImport, { replace: true })
      flash('Datos restaurados')
    } catch (err) {
      flash(err.message || 'Error al importar')
    }
    setPendingImport(null)
  }

  return (
    <div>
      <PageHeader title="Ajustes" />
      <div className="space-y-4 p-4">
        {msg && (
          <div className="animate-fade-in rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {msg}
          </div>
        )}

        {/* Estadística */}
        <div className="card bg-gradient-to-br from-brand to-brand-dark text-white">
          <p className="text-sm font-medium text-white/80">Gastaste en {year}</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatMoney(gastadoAnio)}</p>
          <p className="mt-1 text-sm text-white/70">
            {seriesCount} serie(s) · {records.length} pago(s)
          </p>
        </div>

        {/* Tema */}
        <Section title="Apariencia">
          <button onClick={toggle} className="flex w-full items-center justify-between px-4 py-3.5">
            <span className="flex items-center gap-3 font-medium">
              <Icon name={isDark ? 'dark_mode' : 'light_mode'} className="text-brand" />
              Tema {isDark ? 'oscuro' : 'claro'}
            </span>
            <span className={`relative h-7 w-12 rounded-full transition ${isDark ? 'bg-brand' : 'bg-slate-300'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${isDark ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
        </Section>

        {/* Notificaciones */}
        <Section title="Notificaciones">
          <button
            onClick={toggleNotif}
            disabled={!notifSupported() || notifPerm === 'denied'}
            className="flex w-full items-center justify-between px-4 py-3.5 disabled:opacity-60"
          >
            <span className="flex items-center gap-3 font-medium">
              <Icon name="notifications_active" className="text-brand" />
              Avisar vencimientos
            </span>
            <span className={`relative h-7 w-12 rounded-full transition ${notifOn ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${notifOn ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
          <p className="px-4 pb-3.5 text-xs text-slate-400">
            {!notifSupported()
              ? 'Este dispositivo no soporta notificaciones.'
              : notifPerm === 'denied'
                ? 'Permiso bloqueado. Habilitalo desde los ajustes del navegador para este sitio.'
                : 'Te avisa el día del vencimiento (y los días previos que configures). Funciona mejor con la app instalada; en iPhone requiere iOS 16.4+ e instalarla en la pantalla de inicio.'}
          </p>
        </Section>

        {/* Seguridad */}
        <Section title="Seguridad">
          <button
            onClick={() => setPinDialog(pinOn ? 'verify' : 'set')}
            className="flex w-full items-center justify-between px-4 py-3.5"
          >
            <span className="flex items-center gap-3 font-medium">
              <Icon name="lock" className="text-brand" />
              Bloqueo con PIN
            </span>
            <span className={`relative h-7 w-12 rounded-full transition ${pinOn ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${pinOn ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
          <p className="px-4 pb-3.5 text-xs text-slate-400">
            Pide un PIN de 4 a 6 dígitos al abrir la app. Si lo olvidás no vas a poder entrar, así que guardalo bien.
          </p>
        </Section>

        {/* Backup */}
        <Section title="Copia de seguridad">
          <SettingRow icon="ios_share" label="Compartir backup (Drive, mail…)" onClick={handleShareBackup} />
          <SettingRow icon="cloud_download" label="Descargar backup (JSON)" onClick={handleBackup} />
          <SettingRow icon="cloud_upload" label="Restaurar desde archivo" onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFilePick} />
        </Section>

        {/* Datos */}
        <Section title="Datos">
          {seriesCount === 0 && (
            <SettingRow icon="auto_awesome" label="Cargar datos de ejemplo" onClick={() => setConfirmDemo(true)} />
          )}
          <SettingRow icon="delete_forever" label="Eliminar todos los datos" danger onClick={() => setConfirmWipe(true)} />
        </Section>

        {/* Info */}
        <Section title="Información">
          <div className="flex items-center justify-between px-4 py-3.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Versión</span>
            <span className="font-semibold">{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Almacenamiento</span>
            <span className="font-semibold">IndexedDB (local)</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Último backup</span>
            <span className="font-semibold">{lastBackup ? formatFecha(new Date(lastBackup)) : 'Nunca'}</span>
          </div>
        </Section>

        <p className="px-2 pt-2 text-center text-xs text-slate-400">
          Tus datos nunca salen de este dispositivo. Sin servidores, sin cuentas.
        </p>
        <p className="pb-2 text-center text-xs font-semibold text-slate-400">Mis Pagos v{APP_VERSION}</p>
      </div>

      <ConfirmDialog
        open={!!pendingImport}
        onClose={() => setPendingImport(null)}
        onConfirm={doImport}
        title="Restaurar backup"
        message="Se reemplazarán todos los datos actuales por los del archivo. ¿Continuar?"
        confirmLabel="Restaurar"
      />
      <ConfirmDialog
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={async () => {
          await wipeAll()
          flash('Datos eliminados')
        }}
        title="¿Eliminar todo?"
        message="Se borrarán todas las series y su historial de forma permanente."
        confirmLabel="Eliminar todo"
        danger
      />
      <ConfirmDialog
        open={confirmDemo}
        onClose={() => setConfirmDemo(false)}
        onConfirm={async () => {
          await seedDemoData()
          flash('Datos de ejemplo cargados')
        }}
        title="Cargar ejemplos"
        message="Se agregarán algunas series y pagos de muestra para probar la app."
        confirmLabel="Cargar"
      />
      <PinDialog
        open={!!pinDialog}
        mode={pinDialog || 'set'}
        onClose={() => setPinDialog(null)}
        onSuccess={async (pin) => {
          if (pinDialog === 'set') {
            await setPin(pin)
            setPinOn(true)
            flash('PIN activado')
          } else {
            clearPin()
            setPinOn(false)
            flash('PIN desactivado')
          }
        }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">{children}</div>
    </div>
  )
}

function SettingRow({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 dark:active:bg-slate-800/50">
      <Icon name={icon} className={danger ? 'text-red-500' : 'text-brand'} />
      <span className={`flex-1 font-medium ${danger ? 'text-red-500' : ''}`}>{label}</span>
      <Icon name="chevron_right" className="text-slate-300 dark:text-slate-600" />
    </button>
  )
}
