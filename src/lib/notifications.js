// Helpers de notificaciones del lado de la app (UI + disparo de chequeos).
// La preferencia del usuario vive en localStorage; el chequeo real lo hace el
// service worker (ver src/sw.js + lib/notify-core.js).

const PREF_KEY = 'mp-notif'
const SYNC_TAG = 'mp-check-payments'

export function notifSupported() {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator
}

/** 'granted' | 'denied' | 'default' | 'unsupported' */
export function notifPermission() {
  return notifSupported() ? Notification.permission : 'unsupported'
}

export function notifEnabled() {
  return localStorage.getItem(PREF_KEY) === 'on' && notifPermission() === 'granted'
}

/**
 * Pide permiso y activa las notificaciones.
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export async function enableNotifications() {
  if (!notifSupported()) return 'unsupported'
  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    localStorage.setItem(PREF_KEY, 'off')
    return perm
  }
  localStorage.setItem(PREF_KEY, 'on')
  await registerPeriodicSync()
  await triggerCheck()
  return 'granted'
}

export async function disableNotifications() {
  localStorage.setItem(PREF_KEY, 'off')
  try {
    const reg = await navigator.serviceWorker.ready
    if (reg.periodicSync) await reg.periodicSync.unregister(SYNC_TAG)
  } catch {
    /* noop */
  }
}

/** Registra el chequeo periódico en segundo plano si el navegador lo soporta. */
async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready
    if (!('periodicSync' in reg)) return
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
    if (status.state === 'granted') {
      await reg.periodicSync.register(SYNC_TAG, { minInterval: 12 * 60 * 60 * 1000 })
    }
  } catch {
    /* no soportado / sin permiso: seguimos con el chequeo en primer plano */
  }
}

/** Pide al service worker que revise vencimientos y notifique lo pendiente. */
export async function triggerCheck() {
  if (!notifEnabled()) return
  try {
    const reg = await navigator.serviceWorker.ready
    const target = reg.active || navigator.serviceWorker.controller
    target?.postMessage({ type: 'mp-check' })
  } catch {
    /* noop */
  }
}
