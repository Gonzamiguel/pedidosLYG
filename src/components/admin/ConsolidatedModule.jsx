import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { DAYS, DAY_IDS, MEAL_SLOTS } from '../../data/constants'
import { weekRangeText } from '../../utils/weekHelpers'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

const MONTHS = [
  { value: 'all', label: 'Todos los meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export default function ConsolidatedModule({
  orders,
  companies,
  companiesById,
  formsById,
  dishesById,
}) {
  const currentYear = String(new Date().getFullYear())
  const [companyFilter, setCompanyFilter] = useState('all')
  const [slotFilter, setSlotFilter] = useState('all') // all | lunch | dinner
  const [dayFilter, setDayFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState(currentYear)

  const years = useMemo(() => {
    const set = new Set([currentYear])
    for (const o of orders) {
      const y = (o.weekStart || o.createdAt || '').slice(0, 4)
      if (y) set.add(y)
    }
    return [...set].sort().reverse()
  }, [orders, currentYear])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (companyFilter !== 'all' && o.companyId !== companyFilter) return false

      const monthSource = o.weekStart || o.createdAt || ''
      const y = monthSource.slice(0, 4)
      const m = monthSource.slice(5, 7)
      if (yearFilter !== 'all' && y && y !== yearFilter) return false
      if (monthFilter !== 'all' && m && m !== monthFilter) return false

      if (dayFilter === 'all' && slotFilter === 'all') return true

      return DAY_IDS.some((dayId) => {
        if (dayFilter !== 'all' && dayId !== dayFilter) return false
        const day = o.details?.[dayId]
        if (!day) return false
        const slots =
          slotFilter === 'all' ? ['lunch', 'dinner'] : [slotFilter]
        return slots.some((slot) =>
          Object.values(day[slot] || {}).some((n) => Number(n) > 0),
        )
      })
    })
  }, [orders, companyFilter, slotFilter, dayFilter, monthFilter, yearFilter])

  /** Filas: persona + día + turno + plato + cantidad */
  const rows = useMemo(() => {
    const list = []
    for (const order of filteredOrders) {
      const company = companiesById[order.companyId]
      for (const day of DAYS) {
        if (dayFilter !== 'all' && day.id !== dayFilter) continue
        const dayDetails = order.details?.[day.id]
        if (!dayDetails) continue

        for (const slot of ['lunch', 'dinner']) {
          if (slotFilter !== 'all' && slot !== slotFilter) continue
          const entries = Object.entries(dayDetails[slot] || {}).filter(
            ([, n]) => Number(n) > 0,
          )
          for (const [dishId, count] of entries) {
            list.push({
              key: `${order.id}-${day.id}-${slot}-${dishId}`,
              orderId: order.id,
              companyCode: company?.code || order.companyId,
              userName: order.userName,
              userSector: order.userSector,
              userPhone: order.userPhone,
              dayId: day.id,
              dayLabel: day.label,
              slot,
              slotLabel: MEAL_SLOTS[slot].label,
              dishId,
              dishName: dishesById[dishId]?.name || dishId,
              count: Number(count),
              weekStart: order.weekStart,
              weekEnd: order.weekEnd,
              formId: order.formId,
              createdAt: order.createdAt,
            })
          }
        }
      }
    }

    return list.sort((a, b) => {
      const dayCmp = DAY_IDS.indexOf(a.dayId) - DAY_IDS.indexOf(b.dayId)
      if (dayCmp !== 0) return dayCmp
      if (a.slot !== b.slot) return a.slot === 'lunch' ? -1 : 1
      return a.userName.localeCompare(b.userName, 'es')
    })
  }, [
    filteredOrders,
    dayFilter,
    slotFilter,
    companiesById,
    dishesById,
  ])

  const totals = useMemo(() => {
    return {
      people: new Set(filteredOrders.map((o) => o.id)).size,
      lines: rows.length,
      meals: rows.reduce((s, r) => s + r.count, 0),
    }
  }, [filteredOrders, rows])

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Consolidado de pedidos
            </h3>
            <p className="text-sm text-slate-500">
              Filtrá y mirá quién pidió qué plato, por día y turno.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Empresa</span>
            <select
              className={field}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
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
            <span className="text-sm font-medium text-slate-700">
              Almuerzo / Cena
            </span>
            <select
              className={field}
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
            >
              <option value="all">Ambos</option>
              <option value="lunch">Almuerzo</option>
              <option value="dinner">Cena</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Día</span>
            <select
              className={field}
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mes</span>
            <select
              className={field}
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Año</span>
            <select
              className={field}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Pedidos" value={totals.people} />
        <Metric label="Líneas" value={totals.lines} />
        <Metric label="Viandas" value={totals.meals} />
      </div>

      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {!rows.length ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">
            No hay pedidos con estos filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Quién pidió</th>
                  <th className="px-4 py-3">Día</th>
                  <th className="px-4 py-3">Turno</th>
                  <th className="px-4 py-3">Plato</th>
                  <th className="px-4 py-3 text-right">Cant.</th>
                  <th className="px-4 py-3">Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => (
                  <tr key={row.key} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.companyCode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {row.userName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.userSector}
                        {row.userPhone ? ` · ${row.userPhone}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.dayLabel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          row.slot === 'lunch'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {row.slotLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{row.dishName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {row.weekStart
                        ? weekRangeText({
                            startDate: row.weekStart,
                            endDate: row.weekEnd,
                          })
                        : formsById[row.formId]
                          ? weekRangeText(formsById[row.formId])
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
