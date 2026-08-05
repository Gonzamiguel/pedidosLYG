import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Lock, Plus, Trash2 } from 'lucide-react'
import {
  defaultWeekDraft,
  sundayFromStart,
  validateWeekRange,
  weekLabel,
  weekRangeText,
} from '../../utils/weekHelpers'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function WeeksTab({
  companies,
  weeks,
  onCreate,
  onSetStatus,
  onDelete,
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [draft, setDraft] = useState(defaultWeekDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  const companyWeeks = useMemo(
    () => weeks.filter((w) => w.companyId === companyId),
    [weeks, companyId],
  )

  const active = companyWeeks.find((w) => w.status === 'active')

  const submit = async (e) => {
    e.preventDefault()
    const validation = validateWeekRange(draft.startDate, draft.endDate)
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
      await onCreate({
        companyId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        label: draft.label,
        activate: true,
      })
      setDraft(defaultWeekDraft())
      setOk('Semana creada y activada. El formulario de esa empresa ya la usa.')
    } catch (err) {
      setError(err.message || 'No se pudo crear la semana')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-4 text-sm text-amber-950">
        Definí el período del pedido (por ejemplo lunes a domingo). Solo puede
        haber <strong>una semana activa</strong> por empresa: esa es la que ven
        en el link del formulario.
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h3 className="font-display text-lg font-semibold text-slate-900">
            Nueva semana
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Al crearla se activa y cierra la semana anterior de esa empresa.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Empresa</span>
              <select
                className={field}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Desde</span>
                <input
                  type="date"
                  className={field}
                  value={draft.startDate}
                  onChange={(e) => {
                    const startDate = e.target.value
                    setDraft((prev) => ({
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
                  value={draft.endDate}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Etiqueta (opcional)
              </span>
              <input
                className={field}
                value={draft.label}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Ej: Semana Santa / Semana 12"
              />
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {ok && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {ok}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !companies.length}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Crear y activar semana
          </button>
        </form>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Semanas de la empresa
              </h3>
              {active ? (
                <p className="mt-1 text-sm text-emerald-700">
                  Activa: {weekRangeText(active)}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  No hay semana activa. Creá una para habilitar pedidos.
                </p>
              )}
            </div>
          </div>

          {!companyWeeks.length ? (
            <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
              Todavía no hay semanas cargadas para esta empresa.
            </p>
          ) : (
            <ul className="space-y-3">
              {companyWeeks.map((week) => {
                const isActive = week.status === 'active'
                return (
                  <li
                    key={week.id}
                    className={`rounded-xl border p-4 ${
                      isActive
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-stone-200 bg-stone-50/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CalendarDays
                            className={`h-4 w-4 ${
                              isActive ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                          <p className="font-semibold text-slate-900">
                            {weekLabel(week)}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-slate-600'
                            }`}
                          >
                            {isActive ? 'Activa' : 'Cerrada'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {weekRangeText(week)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => onSetStatus(week.id, 'active')}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Activar
                          </button>
                        )}
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => onSetStatus(week.id, 'closed')}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 hover:bg-stone-50"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Cerrar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                '¿Eliminar esta semana del historial de períodos? Los pedidos ya cargados se conservan.',
                              )
                            ) {
                              onDelete(week.id)
                            }
                          }}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
