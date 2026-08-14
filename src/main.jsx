import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { triggerCheck } from './lib/notifications'
import './index.css'

// Aplica el tema guardado lo antes posible para evitar parpadeo.
const savedTheme = localStorage.getItem('mp-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
  document.documentElement.classList.remove('dark')
} else {
  document.documentElement.classList.add('dark')
}

// Service Worker: actualiza en segundo plano.
registerSW({ immediate: true })

// Revisa vencimientos al iniciar y cada vez que la app vuelve a primer plano
// (si el usuario activó las notificaciones). triggerCheck se auto-filtra.
triggerCheck()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') triggerCheck()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
