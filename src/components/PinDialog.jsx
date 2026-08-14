import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import Icon from './Icon'
import { validPinFormat, verifyPin } from '../lib/pin'

/**
 * Diálogo para configurar o confirmar el PIN.
 * mode 'set'    → pide PIN nuevo dos veces, llama onSuccess(pin).
 * mode 'verify' → pide el PIN actual, llama onSuccess() si coincide.
 */
export default function PinDialog({ open, mode, onClose, onSuccess }) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setPin('')
      setConfirm('')
      setError('')
    }
  }, [open, mode])

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'set') {
      if (!validPinFormat(pin)) return setError('El PIN debe tener 4 a 6 dígitos')
      if (pin !== confirm) return setError('Los PIN no coinciden')
      await onSuccess(pin)
      onClose()
    } else {
      if (!(await verifyPin(pin))) return setError('PIN incorrecto')
      await onSuccess()
      onClose()
    }
  }

  const digits = (v) => v.replace(/\D/g, '')

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:animate-scale-in">
          <DialogTitle className="text-lg font-bold">
            {mode === 'set' ? 'Configurar PIN' : 'Confirmá tu PIN'}
          </DialogTitle>
          {mode === 'set' && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              4 a 6 dígitos. Guardalo bien: sin el PIN no vas a poder entrar a la app.
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="label">{mode === 'set' ? 'PIN nuevo' : 'PIN actual'}</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                className="field text-center text-xl tracking-[0.4em]"
                value={pin}
                onChange={(e) => {
                  setPin(digits(e.target.value))
                  setError('')
                }}
              />
            </div>
            {mode === 'set' && (
              <div>
                <label className="label">Repetí el PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="field text-center text-xl tracking-[0.4em]"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(digits(e.target.value))
                    setError('')
                  }}
                />
              </div>
            )}
            {error && (
              <p className="flex items-center gap-1 text-sm font-medium text-red-500">
                <Icon name="error_outline" className="text-base" /> {error}
              </p>
            )}
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={!pin}>
                {mode === 'set' ? 'Activar' : 'Confirmar'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
