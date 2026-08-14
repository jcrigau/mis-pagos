import { useState } from 'react'
import Icon from './Icon'
import { verifyPin, markUnlocked } from '../lib/pin'

// Pantalla de bloqueo: pide el PIN al abrir la app (si está configurado).
export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pin || checking) return
    setChecking(true)
    const ok = await verifyPin(pin)
    setChecking(false)
    if (ok) {
      markUnlocked()
      onUnlock()
    } else {
      setError(true)
      setPin('')
      navigator.vibrate?.(120)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand/10">
        <Icon name="lock" className="text-4xl text-brand" />
      </span>
      <div className="text-center">
        <h1 className="text-xl font-bold">Mis Pagos</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Ingresá tu PIN para continuar</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          className={`field text-center text-2xl tracking-[0.5em] ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''}`}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setError(false)
          }}
          aria-label="PIN"
        />
        {error && (
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-red-500">
            <Icon name="error_outline" className="text-base" /> PIN incorrecto
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={!pin || checking}>
          <Icon name="lock_open" /> Desbloquear
        </button>
      </form>
    </div>
  )
}
