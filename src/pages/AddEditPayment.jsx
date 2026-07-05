import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { db, createSeries, updateSeries } from '../db'
import { TIPOS, SUBTIPOS, PERIODICIDADES } from '../lib/constants'

const EMPTY = {
  nombre: '',
  tipo: 'Personal',
  subtipo: 'Tarjeta',
  diaVencimiento: '',
  diaIdealPago: '',
  importeUltimo: '',
  periodicidad: 1,
  diasAntesNotificacion: 0,
  notas: '',
  estado: 'activo',
}

export default function AddEditPayment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const existing = useLiveQuery(() => (id ? db.series.get(id) : null), [id])

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({
        nombre: existing.nombre,
        tipo: existing.tipo,
        subtipo: existing.subtipo,
        diaVencimiento: String(existing.diaVencimiento),
        diaIdealPago: String(existing.diaIdealPago),
        importeUltimo: existing.importeUltimo != null ? String(existing.importeUltimo) : '',
        periodicidad: existing.periodicidad,
        diasAntesNotificacion: existing.diasAntesNotificacion,
        notas: existing.notas || '',
        estado: existing.estado,
      })
    }
  }, [existing])

  const set = (k) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [k]: value }))
    setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  function validate() {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Poné un nombre'
    const dv = Number(form.diaVencimiento)
    if (!form.diaVencimiento || dv < 1 || dv > 31) err.diaVencimiento = 'Día entre 1 y 31'
    if (form.diaIdealPago) {
      const di = Number(form.diaIdealPago)
      if (di < 1 || di > 31) err.diaIdealPago = 'Día entre 1 y 31'
    }
    if (form.importeUltimo && Number(form.importeUltimo) < 0) err.importeUltimo = 'No puede ser negativo'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      nombre: form.nombre,
      tipo: form.tipo,
      subtipo: form.subtipo,
      diaVencimiento: Number(form.diaVencimiento),
      diaIdealPago: form.diaIdealPago ? Number(form.diaIdealPago) : Number(form.diaVencimiento),
      importeUltimo: form.importeUltimo === '' ? null : Number(form.importeUltimo),
      periodicidad: Number(form.periodicidad),
      diasAntesNotificacion: Number(form.diasAntesNotificacion) || 0,
      notas: form.notas,
      estado: form.estado,
    }
    if (editing) await updateSeries(id, payload)
    else await createSeries(payload)
    navigate(editing ? `/pago/${id}` : '/', { replace: true })
  }

  const activo = form.estado === 'activo'

  return (
    <div>
      <PageHeader title={editing ? 'Editar pago' : 'Nuevo pago'} back />
      <form onSubmit={handleSubmit} className="space-y-5 p-4" noValidate>
        <Field label="Nombre" error={errors.nombre}>
          <input
            className="field"
            placeholder="Ej: Tarjeta de crédito"
            value={form.nombre}
            onChange={set('nombre')}
            autoFocus={!editing}
          />
        </Field>

        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-3">
            {TIPOS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => set('tipo')(t)}
                className={`btn ${
                  form.tipo === t ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Icon name={t === 'Empresa' ? 'business' : 'person'} />
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Subtipo">
          <select className="field" value={form.subtipo} onChange={set('subtipo')}>
            {SUBTIPOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Día vencimiento" error={errors.diaVencimiento}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              className="field"
              placeholder="10"
              value={form.diaVencimiento}
              onChange={set('diaVencimiento')}
            />
          </Field>
          <Field label="Día ideal de pago" error={errors.diaIdealPago}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              className="field"
              placeholder={form.diaVencimiento || '10'}
              value={form.diaIdealPago}
              onChange={set('diaIdealPago')}
            />
          </Field>
        </div>

        <Field label="Importe (opcional)" error={errors.importeUltimo}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="field"
            placeholder="0.00"
            value={form.importeUltimo}
            onChange={set('importeUltimo')}
          />
        </Field>

        <Field label="Periodicidad">
          <select className="field" value={form.periodicidad} onChange={(e) => set('periodicidad')(Number(e.target.value))}>
            {PERIODICIDADES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Avisar ${form.diasAntesNotificacion} día(s) antes`}>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            className="w-full accent-brand"
            value={form.diasAntesNotificacion}
            onChange={(e) => set('diasAntesNotificacion')(Number(e.target.value))}
          />
        </Field>

        <Field label="Notas (opcional)">
          <textarea className="field min-h-[90px] resize-y" placeholder="Detalle libre…" value={form.notas} onChange={set('notas')} />
        </Field>

        <Field label="Estado">
          <button
            type="button"
            onClick={() => set('estado')(activo ? 'suspendido' : 'activo')}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 ${
              activo
                ? 'border-emerald-300 bg-emerald-500/10 dark:border-emerald-500/40'
                : 'border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <span className="font-semibold">{activo ? 'Activo' : 'Suspendido'}</span>
            <span className={`relative h-7 w-12 rounded-full transition ${activo ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${activo ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          <Icon name="check" /> {editing ? 'Guardar cambios' : 'Crear pago'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-500">
          <Icon name="error_outline" className="text-base" />
          {error}
        </p>
      )}
    </div>
  )
}
