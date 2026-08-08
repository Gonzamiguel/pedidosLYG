import { useEffect, useMemo, useState } from 'react'
import { Download, MapPin, UtensilsCrossed } from 'lucide-react'
import { MEAL_SLOTS } from '../../data/constants'
import {
  aggregateMenuTotals,
  deliveryPlaceForSlot,
  exportDayMenuExcel,
  groupRowsByDeliveryPlace,
} from '../../utils/orderHelpers'
import {
  dayIdFromYmd,
  formatDateTime,
  formatYmdTitle,
  toDateInputValue,
  ymdInRange,
} from '../../utils/weekHelpers'

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
  const [placeFilter, setPlaceFilter] = useState('all')

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
        const place = deliveryPlaceForSlot(order, slot)
        if (placeFilter !== 'all' && place !== placeFilter) continue

        const entries = Object.entries(dayDetails[slot] || {}).filter(
          ([, n]) => Number(n) > 0,
        )
        for (const [dishId, count] of entries) {
          list.push({
            key: `${order.id}-${dayId}-${slot}-${dishId}`,
            companyCode: company?.code || order.companyId,
            userName: order.userName,
            userSector: place,
            userPhone: order.userPhone,
            slot,
            slotLabel: MEAL_SLOTS[slot].label,
            dishId,
            dishName: dishesById[dishId]?.name || dishId,
            count: Number(count),
            createdAtLabel: formatDateTime(order.createdAt),
          })
        }
      }
    }

    return list.sort((a, b) => {
      const placeCmp = a.userSector.localeCompare(b.userSector, 'es')
      if (placeCmp !== 0) return placeCmp
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
    placeFilter,
    companiesById,
    formsById,
    dishesById,
  ])

  const placeOptions = useMemo(() => {
    const set = new Set()
    for (const order of orders) {
      const { start, end } = orderRange(order, formsById)
      if (!ymdInRange(date, start, end)) continue
      if (companyFilter !== 'all' && order.companyId !== companyFilter) continue
      const dayDetails = order.details?.[dayId]
      if (!dayDetails) continue
      const slots =
        slotFilter === 'all' ? ['lunch', 'dinner'] : [slotFilter]
      for (const slot of slots) {
        const hasMeals = Object.values(dayDetails[slot] || {}).some(
          (n) => Number(n) > 0,
        )
        if (!hasMeals) continue
        set.add(deliveryPlaceForSlot(order, slot))
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  }, [orders, date, dayId, companyFilter, slotFilter, formsById])

  useEffect(() => {
    if (placeFilter !== 'all' && !placeOptions.includes(placeFilter)) {
      setPlaceFilter('all')
    }
  }, [placeFilter, placeOptions])

  const menuTotals = useMemo(() => aggregateMenuTotals(rows), [rows])
  const byPlace = useMemo(() => groupRowsByDeliveryPlace(rows), [rows])
  const mealsTotal = useMemo(
    () => rows.reduce((s, r) => s + r.count, 0),
    [rows],
  )

  const headlineDate = formatYmdTitle(date)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Menú del día
              </h3>
              <p className="text-sm text-slate-500">
                Totales a preparar y despacho organizado por lugar de entrega.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!rows.length}
            onClick={() =>
              exportDayMenuExcel({
                dateLabel: headlineDate,
                dateYmd: date,
                menuTotals,
                detailRows: rows,
                byPlace,
              })
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-bordo-700 px-4 text-sm font-semibold text-white hover:bg-bordo-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Lugar de entrega
            </span>
            <select
              className={field}
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {placeOptions.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Para {headlineDate} necesitás preparar
            </p>
          </div>
          {menuTotals.length > 0 && (
            <p className="text-sm text-slate-500">
              Total:{' '}
              <span className="font-semibold tabular-nums text-slate-800">
                {mealsTotal}
              </span>{' '}
              viandas · {menuTotals.length} menús · {byPlace.length} lugares
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

      {!byPlace.length ? null : (
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              Despacho por lugar de entrega
            </h4>
            <p className="text-sm text-slate-500">
              Cada bloque muestra qué llevar a ese lugar y quién lo pidió.
            </p>
          </div>

          {byPlace.map((group) => (
            <section
              key={group.place}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-bordo-600" />
                  <h5 className="text-sm font-semibold text-slate-900">
                    {group.place}
                  </h5>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {group.meals} viandas · {group.rows.length} líneas
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-2 border-b border-stone-100 px-4 py-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.totals.map((item) => (
                  <li
                    key={`${group.place}-${item.dishId}`}
                    className="min-w-0 rounded-lg bg-bordo-50/60 px-3 py-2"
                  >
                    <p className="text-lg font-semibold tabular-nums leading-none text-bordo-800">
                      {item.count}
                    </p>
                    <p
                      className="mt-1 truncate text-xs font-medium text-slate-600"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-white text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Empresa</th>
                      <th className="px-4 py-2.5">Quién pidió</th>
                      <th className="px-4 py-2.5">Servicio</th>
                      <th className="px-4 py-2.5">Plato</th>
                      <th className="px-4 py-2.5 text-right">Cant.</th>
                      <th className="px-4 py-2.5">Cargado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {group.rows.map((row) => (
                      <tr key={row.key} className="hover:bg-stone-50/80">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {row.companyCode}
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-slate-900">
                            {row.userName}
                          </p>
                          {row.userPhone ? (
                            <p className="text-xs text-slate-500">
                              {row.userPhone}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              row.slot === 'lunch'
                                ? 'bg-bordo-50 text-bordo-800'
                                : 'bg-lg-100 text-lg-800'
                            }`}
                          >
                            {row.slotLabel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                          {row.dishName}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                          {row.count}
                        </td>
                        <td className="px-4 py-2.5 text-xs tabular-nums text-slate-500">
                          {row.createdAtLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
