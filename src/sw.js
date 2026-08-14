/* Service worker custom (estrategia injectManifest).
 * - Precachea la app (offline).
 * - Muestra notificaciones de vencimientos: a pedido de la app (message) y en
 *   segundo plano donde el navegador lo soporte (periodicsync, Android PWA).
 */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { runNotificationCheck } from './lib/notify-core'

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// La app pide un chequeo (al abrirse o volver a primer plano).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'mp-check') {
    event.waitUntil(runNotificationCheck(self.registration))
  }
})

// Chequeo periódico en segundo plano (Chrome/Android, PWA instalada).
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mp-check-payments') {
    event.waitUntil(runNotificationCheck(self.registration))
  }
})

// Al tocar una notificación: enfoca la app o la abre.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
