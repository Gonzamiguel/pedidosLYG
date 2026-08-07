import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { DAYS, MAX_DISHES_PER_SLOT } from '../../data/constants'
import {
  dayIdsInRange,
  emptyFormDays,
  formTitle,
  normalizeFormDays,
} from '../../data/formHelpers'
import { formOrderPath, formOrderUrl } from '../../utils/formLinks'
import {
  defaultWeekDraft,
  sundayFromStart,
  validateWeekRange,
  weekRangeText,
} from '../../utils/weekHelpers'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

export default function FormsModule({ catalog }) {
  const [mode, setMode] = useState('list') // list | create | edit
  const [editingId, setEditingId] = useState('')
  const [companyId, setCompanyId] = useState(catalog.companies[0]?.id || '')
  const [dates, setDates] = useState(defaultWeekDraft)
  const [days, setDays] = useState(emptyFormDays)
  const [activeDay, setActiveDay] = useState('lun')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [savedLink, setSavedLink] = useState('')

  const visibleDayIds = useMemo(
    () => dayIdsInRange(dates.startDate, dates.endDate),
    [dates.startDate, dates.endDate],
  )

  useEffect(() => {
    if (!visibleDayIds.includes(activeDay) && visibleDayIds[0]) {
      setActiveDay(visibleDayIds[0])
    }
  }, [visibleDayIds, activeDay])

  const startCreate = async () => {
    // Recargar empresas/platos por si se acabaron de crear en Configuración
    try {
      await catalog.refresh()
    } catch {
      /* ignore */
    }
    setMode('create')
    setEditingId('')
    setDates(defaultWeekDraft())
    setDays(emptyFormDays())
    setActiveDay('lun')
    setError('')
    setOk('')
    setSavedLink('')
  }

  // Cuando entran al alta o llegan empresas nuevas, seleccionar la primera
  useEffect(() => {
    if (mode !== 'create' && mode !== 'edit') return
    if (!catalog.companies.length) {
      setCompanyId('')
      return
    }
    if (!catalog.companies.some((c) => c.id === companyId)) {
      setCompanyId(catalog.companies[0].id)
    }
  }, [mode, catalog.companies, companyId])

  const startEdit = (form) => {
    setMode('edit')
    setEditingId(form.id)
    setCompanyId(form.companyId)
    setDates({
      startDate: form.startDate,
      endDate: form.endDate,
      label: '',
    })
    setDays(normalizeFormDays(form.days))
    setActiveDay(dayIdsInRange(form.startDate, form.endDate)[0] || 'lun')
    setError('')
    setOk('')
    setSavedLink(formOrderUrl(form.id))
  }

  const toggleDish = (slot, dishId) => {
    setDays((prev) => {
      const current = prev[activeDay]?.[slot] || []
      let next
      if (current.includes(dishId)) {
        next = current.filter((id) => id !== dishId)
      } else {
        if (current.length >= MAX_DISHES_PER_SLOT) {
          setError(`Máximo ${MAX_DISHES_PER_SLOT} platos por turno`)
          return prev
        }
        next = [...current, dishId]
      }
      setError('')
      return {
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          [slot]: next,
        },
      }
    })
  }

  const save = async () => {
    const validation = validateWeekRange(dates.startDate, dates.endDate)
    if (validation) {
      setError(validation)
      return
    }
    if (!companyId) {
      setError('Seleccioná una empresa')
      return
    }

    setBusy(true)
    setError('')
    setOk('')
    try {
      const payload = {
        companyId,
        startDate: dates.startDate,
        endDate: dates.endDate,
        days: normalizeFormDays(days),
        status: 'open',
      }

      let form
      if (mode === 'edit' && editingId) {
        form = await catalog.editForm(editingId, payload)
      } else {
        form = await catalog.addForm(payload)
      }

      const url = formOrderUrl(form.id)
      setSavedLink(url)
      setOk('Formulario guardado. Ya podés copiar el link de pedido.')
      setMode('list')
      setEditingId('')
    } catch (err) {
      setError(err.message || 'No se pudo guardar el formulario')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async (formId) => {
    const url = formOrderUrl(formId)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(formId)
      setTimeout(() => setCopiedId(''), 2000)
    } catch {
      window.prompt('Copiá este link:', url)
    }
  }

  if (mode === 'create' || mode === 'edit') {
    const lunchSelected = days[activeDay]?.lunch || []
    const dinnerSelected = days[activeDay]?.dinner || []

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {mode === 'edit' ? 'Editar formulario' : 'Nuevo formulario'}
            </h3>
            <p className="text-sm text-slate-500">
              Empresa, fechas y platos por día (almuerzo / cena).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode('list')}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-stone-100"
          >
            Volver al listado
          </button>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-1">
              <span className="text-sm font-medium text-slate-700">Empresa</span>
              <select
                className={field}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                {catalog.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Desde</span>
              <input
                type="date"
                className={field}
                value={dates.startDate}
                onChange={(e) => {
                  const startDate = e.target.value
                  setDates((prev) => ({
                    ...prev,
                    startDate,
                    endDate: startDate
                      ? sundayFromStart(startDate)
                      : prev.endDate,
                  }))
                }}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Hasta</span>
              <input
                type="date"
                className={field}
                value={dates.endDate}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Seleccioná el día y asigná hasta {MAX_DISHES_PER_SLOT} platos por
            turno
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.filter((d) => visibleDayIds.includes(d.id)).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDay(d.id)}
                className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${
                  activeDay === d.id
                    ? 'bg-bordo-700 text-white'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <SlotPicker
              title="Almuerzo"
              tone="lunch"
              dishes={catalog.dishes}
              selected={lunchSelected}
              onToggle={(id) => toggleDish('lunch', id)}
            />
            <SlotPicker
              title="Cena"
              tone="dinner"
              dishes={catalog.dishes}
              selected={dinnerSelected}
              onToggle={(id) => toggleDish('dinner', id)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {ok && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {ok}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !catalog.companies.length}
            onClick={save}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-bordo-700 px-5 text-sm font-semibold text-white hover:bg-bordo-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar formulario y generar link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Formularios</h3>
          <p className="text-sm text-slate-500">
            Generá un formulario por empresa y período. Al guardar se crea el
            link de pedidos.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          disabled={!catalog.companies.length}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-bordo-700 px-4 text-sm font-semibold text-white hover:bg-bordo-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Generar formulario
        </button>
      </div>

      {savedLink && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Último link generado:{' '}
          <code className="break-all font-mono text-xs">{savedLink}</code>
        </div>
      )}

      {!catalog.companies.length ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Primero cargá una empresa en Configuración.
        </p>
      ) : !catalog.forms.length ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Todavía no hay formularios. Creá el primero.
        </p>
      ) : (
        <ul className="space-y-3">
          {catalog.forms.map((form) => {
            const company = catalog.companiesById[form.companyId]
            const url = formOrderUrl(form.id)
            const copied = copiedId === form.id
            const closed = form.status === 'closed'
            return (
              <li
                key={form.id}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {formTitle(form, company)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {weekRangeText(form)} ·{' '}
                      {closed ? 'Cerrado' : 'Abierto para pedidos'}
                    </p>
                    <p className="mt-2 truncate rounded-lg bg-stone-50 px-2.5 py-1.5 font-mono text-xs text-slate-600 ring-1 ring-stone-200">
                      {url}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(form.id)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bordo-700 px-3 text-xs font-semibold text-white hover:bg-bordo-800"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copiado' : 'Copiar link'}
                  </button>
                  <a
                    href={formOrderPath(form.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 hover:bg-stone-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir
                  </a>
                  <button
                    type="button"
                    onClick={() => startEdit(form)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 hover:bg-stone-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      catalog.editForm(form.id, {
                        status: closed ? 'open' : 'closed',
                      })
                    }
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 hover:bg-stone-50"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {closed ? 'Reabrir' : 'Cerrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Eliminar este formulario?')) {
                        catalog.removeForm(form.id)
                      }
                    }}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SlotPicker({ title, tone, dishes, selected, onToggle }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        tone === 'lunch'
          ? 'border-bordo-200 bg-bordo-50/40'
          : 'border-lg-200 bg-lg-100/40'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4
          className={`text-sm font-semibold ${
            tone === 'lunch' ? 'text-bordo-800' : 'text-lg-800'
          }`}
        >
          {title}
        </h4>
        <span className="text-xs text-slate-500">
          {selected.length}/{MAX_DISHES_PER_SLOT}
        </span>
      </div>
      {!dishes.length ? (
        <p className="text-sm text-slate-500">
          No hay platos. Cargalos en Configuración.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {dishes.map((dish) => {
            const checked = selected.includes(dish.id)
            return (
              <li key={dish.id}>
                <label
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                    checked
                      ? 'bg-white shadow-sm ring-1 ring-slate-300'
                      : 'hover:bg-white/70'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(dish.id)}
                    className="accent-bordo-700"
                  />
                  <span className="text-slate-800">
                    {dish.name}
                    {dish.tag ? (
                      <span className="ml-2 text-xs text-slate-400">
                        {dish.tag}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
