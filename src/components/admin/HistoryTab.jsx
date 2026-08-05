import { useMemo, useState } from 'react'
import { History, Search } from 'lucide-react'
import { DAYS, MEAL_SLOTS } from '../../data/constants'
import { countDayMeals } from '../../utils/orderHelpers'
import { formatYmd, weekLabel, weekRangeText } from '../../utils/weekHelpers'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function HistoryTab({
  orders,
  weeks,
  companies,
  companiesById,
  weeksById,
  dishesById,
}) {
  const [companyFilter, setCompanyFilter] = useState('all')
  const [weekFilter, setWeekFilter] = useState('all')
  const [queryText, setQueryText] = useState('')
  const [expanded, setExpanded] = useState('')

  const weekOptions = useMemo(() => {
    const list =
      companyFilter === 'all'
        ? weeks
        : weeks.filter((w) => w.companyId === companyFilter)
    return list
  }, [weeks, companyFilter])

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase()
    return orders.filter((o) => {
      if (companyFilter !== 'all' && o.companyId !== companyFilter) return false
      if (weekFilter !== 'all' && o.weekId !== weekFilter) return false
      if (!q) return true
      const company = companiesById[o.companyId]
      const hay = [
        o.userName,
        o.userSector,
        o.userPhone,
        company?.code,
        company?.name,
        o.weekStart,
        o.weekEnd,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [orders, companyFilter, weekFilter, queryText, companiesById])

  const weekStats = useMemo(() => {
    const map = new Map()
    for (const o of filtered) {
      const key = o.weekId || `${o.weekStart}_${o.weekEnd}` || 'sin-semana'
      const prev = map.get(key) || {
        weekId: o.weekId,
        weekStart: o.weekStart,
        weekEnd: o.weekEnd,
        companyId: o.companyId,
        orders: 0,
        meals: 0,
      }
      prev.orders += 1
      prev.meals += Number(o.totalMeals) || 0
      map.set(key, prev)
    }
    return [...map.values()].sort((a, b) =>
      (b.weekStart || '').localeCompare(a.weekStart || ''),
    )
  }, [filtered])

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
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
              <option value="all">Todas</option>
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

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Buscar</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${field} pl-9`}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Nombre, sector, teléfono…"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Pedidos" value={filtered.length} />
        <Metric
          label="Viandas"
          value={filtered.reduce((s, o) => s + (Number(o.totalMeals) || 0), 0)}
        />
        <Metric label="Semanas con pedidos" value={weekStats.length} />
      </div>

      {!!weekStats.length && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <History className="h-5 w-5 text-amber-600" />
            Resumen por semana
          </h3>
          <ul className="divide-y divide-stone-100">
            {weekStats.map((stat) => {
              const week = weeksById[stat.weekId]
              const company = companiesById[stat.companyId]
              return (
                <li
                  key={`${stat.weekId}-${stat.weekStart}-${stat.companyId}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {company?.code || stat.companyId} ·{' '}
                      {week
                        ? weekLabel(week)
                        : `${formatYmd(stat.weekStart)} → ${formatYmd(stat.weekEnd)}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {week
                        ? weekRangeText(week)
                        : stat.weekStart
                          ? weekRangeText(stat)
                          : 'Sin período'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {stat.orders} pedidos · {stat.meals} viandas
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">
          Historial de pedidos
        </h3>

        {!filtered.length ? (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
            No hay pedidos con estos filtros.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((order) => {
              const company = companiesById[order.companyId]
              const week = weeksById[order.weekId]
              const open = expanded === order.id
              return (
                <li
                  key={order.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/60"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? '' : order.id)}
                    className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {order.userName}{' '}
                        <span className="font-normal text-slate-500">
                          · {order.userSector}
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {company?.code || order.companyId} ·{' '}
                        {week
                          ? weekRangeText(week)
                          : order.weekStart
                            ? weekRangeText(order)
                            : 'Sin semana'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.userPhone} ·{' '}
                        {new Date(order.createdAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                      {order.totalMeals} viandas
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-stone-200 px-4 py-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {DAYS.map((day) => {
                          const dayDetails = order.details?.[day.id]
                          const dayTotal = countDayMeals(dayDetails)
                          if (!dayTotal) return null
                          return (
                            <div
                              key={day.id}
                              className="rounded-lg bg-white px-3 py-2 ring-1 ring-stone-200"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {day.label}{' '}
                                <span className="font-normal text-slate-500">
                                  ({dayTotal})
                                </span>
                              </p>
                              {['lunch', 'dinner'].map((slot) => {
                                const entries = Object.entries(
                                  dayDetails?.[slot] || {},
                                ).filter(([, n]) => Number(n) > 0)
                                if (!entries.length) return null
                                return (
                                  <div key={slot} className="mt-1.5">
                                    <p
                                      className={`text-[11px] font-bold uppercase tracking-wide ${
                                        slot === 'lunch'
                                          ? 'text-amber-700'
                                          : 'text-indigo-700'
                                      }`}
                                    >
                                      {MEAL_SLOTS[slot].label}
                                    </p>
                                    <ul className="mt-0.5 space-y-0.5 text-sm text-slate-700">
                                      {entries.map(([dishId, count]) => (
                                        <li key={dishId}>
                                          {count}×{' '}
                                          {dishesById[dishId]?.name || dishId}
                                        </li>
                                      ))}
                                    </ul>
                                    {dayDetails?.notes?.[slot]?.trim() && (
                                      <p className="mt-1 text-xs italic text-slate-500">
                                        Obs: {dayDetails.notes[slot]}
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-bold text-amber-700">
        {value}
      </p>
    </div>
  )
}
