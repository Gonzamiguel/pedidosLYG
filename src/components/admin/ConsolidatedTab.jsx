import { useMemo, useState } from 'react'
import { Download, UtensilsCrossed } from 'lucide-react'
import { DAYS, MEAL_SLOTS } from '../../data/constants'
import {
  consolidateOrders,
  exportKitchenCsv,
} from '../../utils/orderHelpers'

export default function ConsolidatedTab({
  orders,
  companies,
  dishesById,
  companiesById,
}) {
  const [filter, setFilter] = useState('all')

  const consolidated = useMemo(
    () => consolidateOrders(orders, filter),
    [orders, filter],
  )

  const companyLabel =
    filter === 'all'
      ? 'Todas'
      : companiesById[filter]?.code || filter

  const metrics = [
    { label: 'Pedidos', value: consolidated.metrics.totalOrders },
    { label: 'Almuerzos', value: consolidated.metrics.lunchTotal },
    { label: 'Cenas', value: consolidated.metrics.dinnerTotal },
    { label: 'Gran total', value: consolidated.metrics.grandTotal },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1">
          <span className="text-xs text-slate-400">Filtrar por empresa</span>
          <select
            className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas las empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            exportKitchenCsv(consolidated, dishesById, companyLabel)
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Download className="h-4 w-4" />
          Exportar CSV / Excel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3"
          >
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-400">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <UtensilsCrossed className="h-4 w-4 text-amber-400" />
          Resumen de cocina por día
        </h3>

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
              className="rounded-xl border border-slate-700 bg-slate-800/40 p-3"
            >
              <p className="font-semibold text-white">{day.label}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
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
          <p className="rounded-xl border border-dashed border-slate-600 px-4 py-8 text-center text-sm text-slate-400">
            Todavía no hay pedidos para consolidar.
          </p>
        )}
      </div>
    </div>
  )
}

function SlotSummary({ title, entries, dishesById, tone }) {
  if (!entries.length) {
    return (
      <div className="text-xs text-slate-500">
        <p
          className={`mb-1 font-bold uppercase tracking-wide ${
            tone === 'lunch' ? 'text-amber-500/70' : 'text-indigo-400/70'
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
        className={`mb-1 text-xs font-bold uppercase tracking-wide ${
          tone === 'lunch' ? 'text-amber-400' : 'text-indigo-300'
        }`}
      >
        {title}
      </p>
      <ul className="space-y-1 text-sm text-slate-200">
        {entries.map(([dishId, count]) => (
          <li key={dishId} className="flex justify-between gap-2">
            <span className="truncate">
              {dishesById[dishId]?.name || dishId}
            </span>
            <span className="shrink-0 font-bold text-amber-300">{count}x</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
