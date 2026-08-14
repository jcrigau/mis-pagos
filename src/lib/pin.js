// Bloqueo con PIN. El PIN nunca se guarda en texto plano: se persiste
// salt + SHA-256(salt:pin) en localStorage. El desbloqueo dura la sesión
// (sessionStorage), así no se vuelve a pedir en cada navegación.

const PIN_KEY = 'mp-pin'
const UNLOCK_KEY = 'mp-unlocked'

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY)
}

/** ¿Hay que mostrar la pantalla de bloqueo? */
export function isLocked() {
  return hasPin() && sessionStorage.getItem(UNLOCK_KEY) !== '1'
}

export function markUnlocked() {
  sessionStorage.setItem(UNLOCK_KEY, '1')
}

export function validPinFormat(pin) {
  return /^\d{4,6}$/.test(pin)
}

export async function setPin(pin) {
  const salt = [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  localStorage.setItem(PIN_KEY, `${salt}:${await hashPin(pin, salt)}`)
  markUnlocked()
}

export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return true
  const [salt, hash] = stored.split(':')
  return (await hashPin(pin, salt)) === hash
}

export function clearPin() {
  localStorage.removeItem(PIN_KEY)
  sessionStorage.removeItem(UNLOCK_KEY)
}
