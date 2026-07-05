import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  danger = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:animate-scale-in">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {message && <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>}
          <div className="mt-6 flex gap-3">
            <button className="btn-secondary flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button
              className={`flex-1 ${danger ? 'btn bg-red-500 text-white hover:bg-red-600' : 'btn-primary'}`}
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
