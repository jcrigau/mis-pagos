# Mis Pagos 💳

PWA (instalable en iOS / Android / Web) para gestionar **recordatorios de pagos recurrentes**, con histórico completo, exportación a Excel y backup offline vía JSON.

**100% offline** — los datos viven en tu dispositivo (IndexedDB). Sin servidores, sin cuentas, sin sync automática.

## Características

- 📅 **Dashboard** de próximos vencimientos (90 días), con estado visual: vencido / urgente / lejano.
- 🔁 **Series recurrentes**: mensual, bimestral, trimestral, semestral o anual — próximo vencimiento calculado on-the-fly (no genera registros futuros).
- ✅ **Registro de pagos** con histórico por serie; el importe sugiere el próximo.
- 🔎 **Historial + filtros** (tipo, subtipo, rango de fechas, estado) y **exportación a Excel**.
- 💾 **Backup / Restore** manual en JSON.
- 🌙 **Modo oscuro** por defecto, con toggle claro/oscuro persistente.
- 📲 **Instalable** como app (manifest + Service Worker vía Workbox).

## Stack

React 18 + Vite · Dexie.js (IndexedDB) · Tailwind CSS · Headless UI · Material Icons · vite-plugin-pwa (Workbox) · SheetJS (xlsx).

## Desarrollo

```bash
npm install
npm run gen-icons   # genera los PNG de la PWA desde public/favicon.svg
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

El deploy es automático vía GitHub Actions al hacer push a `main`
(`.github/workflows/deploy.yml`).

1. En el repo: **Settings → Pages → Source: GitHub Actions**.
2. Push a `main` → la app queda en `https://<usuario>.github.io/mis-pagos/`.

> El `base` del proyecto está fijado en `/mis-pagos/` (ver `vite.config.js`).
> Si cambiás el nombre del repo, actualizá esa constante.

## Estructura

```
src/
  components/   UI reutilizable (cards, badges, modales, nav)
  pages/        Home · AddEditPayment · PaymentDetail · History · Settings
  lib/          dates (cálculo de vencimientos) · pending · export · constants · demo
  hooks/        useTheme
  db.js         Dexie (series + records) y operaciones
```
