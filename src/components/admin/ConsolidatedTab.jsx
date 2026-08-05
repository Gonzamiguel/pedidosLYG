import { useEffect, useMemo, useState } from 'react'
import { Download, UtensilsCrossed } from 'lucide-react'
import { DAYS, MEAL_SLOTS } from '../../data/constants'
import {
  consolidateOrders,
  exportKitchenCsv,
} from '../../utils/orderHelpers'
import { weekLabel } from '../../utils/weekHelpers'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function ConsolidatedTab({
  orders,
  weeks,
  companies,
  dishesById,
  companiesById,
}) {
  const [companyFilter, setCompanyFilter] = useState('all')
  const [weekFilter, setWeekFilter] = useState('all')

  const weekOptions = useMemo(() => {
    if (companyFilter === 'all') return weeks
    return weeks.filter((w) => w.companyId === companyFilter)
  }, [weeks, companyFilter])

  useEffect(() => {
    const active = weekOptions.find((w) => w.status === 'active')
    if (weekFilter !== 'all' && weekOptions.some((w) => w.id === weekFilter)) {
      return
    }
    setWeekFilter(active?.id || 'all')
  }, [companyFilter, weekOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const consolidated = useMemo(
    () => consolidateOrders(orders, companyFilter, weekFilter),
    [orders, companyFilter, weekFilter],
  )

  const companyLabel =
    companyFilter === 'all'
      ? 'Todas'
      : companiesById[companyFilter]?.code || companyFilter

  const weekMeta = weeks.find((w) => w.id === weekFilter)

  const metrics = [
    { label: 'Pedidos', value: consolidated.metrics.totalOrders },
    { label: 'Almuerzos', value: consolidated.metrics.lunchTotal },
    { label: 'Cenas', value: consolidated.metrics.dinnerTotal },
    { label: 'Gran total', value: consolidated.metrics.grandTotal },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Empresa</span>
            <select
              className={field}
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value)
                setWeekFilter('all')
              }}
            >
              <option value="all">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Semana</span>
            <select
              className={field}
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
            >
              <option value="all">Todas las semanas</option>
              {weekOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {weekLabel(w)}
                  {w.status === 'active' ? ' (activa)' : ''}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() =>
              exportKitchenCsv(
                consolidated,
                dishesById,
                `${companyLabel}${weekMeta ? `_${weekLabel(weekMeta)}` : ''}`,
              )
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <Download className="h-4 w-4" />
            Exportar CSV / Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {m.label}
            </p>
            <p className="mt-1 text-3xl font-bold text-amber-700">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <UtensilsCrossed className="h-5 w-5 text-amber-600" />
          Resumen de cocina por día
        </h3>

        <div className="space-y-3">
          {DAYS.map((day) => {
            const lunchEntries = Object.entries(
              consolidated.byDay[day.id].lunch,
            ).sort((a, b) => b[1] - a[1])
            const dinnerEntries = Object.entries(
              consolidated.byDay[day.id].dinner,
            ).sort((a, b) => b[1] - a[1])

            if (!lunchEntries.length && !dinnerEntries.length) return null

            return (
              <div
                key={day.id}
                className="rounded-xl border border-stone-200 bg-stone-50/70 p-4"
              >
                <p className="font-semibold text-slate-900">{day.label}</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <SlotSummary
                    title={MEAL_SLOTS.lunch.label}
                    entries={lunchEntries}
                    dishesById={dishesById}
                    tone="lunch"
                  />
                  <SlotSummary
                    title={MEAL_SLOTS.dinner.label}
                    entries={dinnerEntries}
                    dishesById={dishesById}
                    tone="dinner"
                  />
                </div>
              </div>
            )
          })}

          {!consolidated.metrics.grandTotal && (
            <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
              No hay pedidos para este filtro.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function SlotSummary({ title, entries, dishesById, tone }) {
  if (!entries.length) {
    return (
      <div className="text-sm text-slate-400">
        <p
          className={`mb-1 text-xs font-bold uppercase tracking-wide ${
            tone === 'lunch' ? 'text-amber-700/70' : 'text-indigo-700/70'
          }`}
        >
          {title}
        </p>
        Sin pedidos
      </div>
    )
  }

  return (
    <div>
      <p
        className={`mb-1.5 text-xs font-bold uppercase tracking-wide ${
          tone === 'lunch' ? 'text-amber-700' : 'text-indigo-700'
        }`}
      >
        {title}
      </p>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {entries.map(([dishId, count]) => (
          <li
            key={dishId}
            className="flex justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-stone-200/80"
          >
            <span className="truncate">
              {dishesById[dishId]?.name || dishId}
            </span>
            <span className="shrink-0 font-bold text-amber-700">{count}x</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
