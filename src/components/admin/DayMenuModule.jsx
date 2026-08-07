import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react'
import { MEAL_SLOTS } from '../../data/constants'
import { aggregateMenuTotals } from '../../utils/orderHelpers'
import {
  dayIdFromYmd,
  formatYmd,
  formatYmdTitle,
  toDateInputValue,
  ymdInRange,
} from '../../utils/weekHelpers'

const PAGE_SIZE = 10

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

function orderRange(order, formsById) {
  const form = formsById[order.formId]
  return {
    start: order.weekStart || form?.startDate || '',
    end: order.weekEnd || form?.endDate || '',
  }
}

export default function DayMenuModule({
  orders,
  companies,
  companiesById,
  formsById,
  dishesById,
}) {
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [companyFilter, setCompanyFilter] = useState('all')
  const [slotFilter, setSlotFilter] = useState('all')
  const [page, setPage] = useState(1)

  const dayId = dayIdFromYmd(date)

  const rows = useMemo(() => {
    if (!dayId) return []
    const list = []

    for (const order of orders) {
      if (companyFilter !== 'all' && order.companyId !== companyFilter) continue

      const { start, end } = orderRange(order, formsById)
      if (!ymdInRange(date, start, end)) continue

      const dayDetails = order.details?.[dayId]
      if (!dayDetails) continue

      const company = companiesById[order.companyId]
      const slots =
        slotFilter === 'all' ? ['lunch', 'dinner'] : [slotFilter]

      for (const slot of slots) {
        const entries = Object.entries(dayDetails[slot] || {}).filter(
          ([, n]) => Number(n) > 0,
        )
        for (const [dishId, count] of entries) {
          list.push({
            key: `${order.id}-${dayId}-${slot}-${dishId}`,
            companyCode: company?.code || order.companyId,
            userName: order.userName,
            userSector: order.userSector,
            userPhone: order.userPhone,
            slot,
            slotLabel: MEAL_SLOTS[slot].label,
            dishId,
            dishName: dishesById[dishId]?.name || dishId,
            count: Number(count),
          })
        }
      }
    }

    return list.sort((a, b) => {
      if (a.slot !== b.slot) return a.slot === 'lunch' ? -1 : 1
      const dishCmp = a.dishName.localeCompare(b.dishName, 'es')
      if (dishCmp !== 0) return dishCmp
      return a.userName.localeCompare(b.userName, 'es')
    })
  }, [
    orders,
    date,
    dayId,
    companyFilter,
    slotFilter,
    companiesById,
    formsById,
    dishesById,
  ])

  const menuTotals = useMemo(() => aggregateMenuTotals(rows), [rows])
  const mealsTotal = useMemo(
    () => rows.reduce((s, r) => s + r.count, 0),
    [rows],
  )

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [date, companyFilter, slotFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return rows.slice(start, start + PAGE_SIZE)
  }, [rows, page])

  const rangeStart = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(page * PAGE_SIZE, rows.length)

  const headlineDate = formatYmdTitle(date)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Menú del día
            </h3>
            <p className="text-sm text-slate-500">
              Totales a preparar y quién lo pidió, para una fecha concreta.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Fecha</span>
            <input
              type="date"
              className={field}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

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
            <span className="text-sm font-medium text-slate-700">Servicio</span>
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
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Para {headlineDate} necesitás
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{formatYmd(date)}</p>
          </div>
          {menuTotals.length > 0 && (
            <p className="text-sm text-slate-500">
              Total:{' '}
              <span className="font-semibold tabular-nums text-slate-800">
                {mealsTotal}
              </span>{' '}
              viandas · {menuTotals.length} menús
            </p>
          )}
        </div>

        {!menuTotals.length ? (
          <p className="mt-5 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-slate-500">
            No hay pedidos para esta fecha con estos filtros.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {menuTotals.map((item) => (
              <li
                key={item.dishId}
                className="min-w-0 rounded-lg bg-stone-50 px-3 py-2.5"
              >
                <p className="text-2xl font-semibold tabular-nums leading-none text-slate-900">
                  {item.count}
                </p>
                <p
                  className="mt-1 truncate text-sm font-medium text-slate-600"
                  title={item.name}
                >
                  {item.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-3">
          <h4 className="text-sm font-semibold text-slate-900">
            Quién lo pidió
          </h4>
          <p className="text-xs text-slate-500">
            Registro del día, de a {PAGE_SIZE} filas.
          </p>
        </div>

        {!rows.length ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            Sin registros para mostrar.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Quién pidió</th>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3">Plato</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pageRows.map((row) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Mostrando {rangeStart}–{rangeEnd} de {rows.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="min-w-[7rem] text-center text-sm font-medium text-slate-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
