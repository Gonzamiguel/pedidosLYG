import { useEffect, useMemo, useState } from 'react'
import { Download, MapPin, Moon, Sun, UtensilsCrossed } from 'lucide-react'
import { MEAL_SLOTS } from '../../data/constants'
import {
  aggregateMenuTotals,
  deliveryPlaceForSlot,
  exportDayMenuExcel,
  groupRowsByDeliveryPlace,
  groupRowsBySlotAndPlace,
} from '../../utils/orderHelpers'
import {
  dayIdFromYmd,
  eachYmdInRange,
  formatDateTime,
  formatYmd,
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

function overlapDays(dateFrom, dateTo, orderStart, orderEnd) {
  if (!orderStart || !orderEnd) return []
  return eachYmdInRange(dateFrom, dateTo).filter((ymd) =>
    ymdInRange(ymd, orderStart, orderEnd),
  )
}

export default function DayMenuModule({
  orders,
  companies,
  companiesById,
  formsById,
  dishesById,
}) {
  const today = toDateInputValue(new Date())
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [companyFilter, setCompanyFilter] = useState('all')
  const [placeFilter, setPlaceFilter] = useState('all')

  const rows = useMemo(() => {
    if (!dateFrom || !dateTo) return []
    const list = []

    for (const order of orders) {
      if (companyFilter !== 'all' && order.companyId !== companyFilter) continue

      const { start, end } = orderRange(order, formsById)
      const days = overlapDays(dateFrom, dateTo, start, end)
      if (!days.length) continue

      const company = companiesById[order.companyId]

      for (const ymd of days) {
        const dayId = dayIdFromYmd(ymd)
        if (!dayId) continue
        const dayDetails = order.details?.[dayId]
        if (!dayDetails) continue

        for (const slot of ['lunch', 'dinner']) {
          const place = deliveryPlaceForSlot(order, slot)
          if (placeFilter !== 'all' && place !== placeFilter) continue

          const entries = Object.entries(dayDetails[slot] || {}).filter(
            ([, n]) => Number(n) > 0,
          )
          for (const [dishId, count] of entries) {
            list.push({
              key: `${order.id}-${ymd}-${slot}-${dishId}`,
              companyCode: company?.code || order.companyId,
              userName: order.userName,
              userSector: place,
              userPhone: order.userPhone,
              dayId,
              dateYmd: ymd,
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
    }

    return list.sort((a, b) => {
      if (a.slot !== b.slot) return a.slot === 'lunch' ? -1 : 1
      const placeCmp = a.userSector.localeCompare(b.userSector, 'es')
      if (placeCmp !== 0) return placeCmp
      const dishCmp = a.dishName.localeCompare(b.dishName, 'es')
      if (dishCmp !== 0) return dishCmp
      return a.userName.localeCompare(b.userName, 'es')
    })
  }, [
    orders,
    dateFrom,
    dateTo,
    companyFilter,
    placeFilter,
    companiesById,
    formsById,
    dishesById,
  ])

  const placeOptions = useMemo(() => {
    const set = new Set()
    for (const order of orders) {
      if (companyFilter !== 'all' && order.companyId !== companyFilter) continue
      const { start, end } = orderRange(order, formsById)
      const days = overlapDays(dateFrom, dateTo, start, end)
      for (const ymd of days) {
        const dayId = dayIdFromYmd(ymd)
        const dayDetails = order.details?.[dayId]
        if (!dayDetails) continue
        for (const slot of ['lunch', 'dinner']) {
          const hasMeals = Object.values(dayDetails[slot] || {}).some(
            (n) => Number(n) > 0,
          )
          if (!hasMeals) continue
          set.add(deliveryPlaceForSlot(order, slot))
        }
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  }, [orders, dateFrom, dateTo, companyFilter, formsById])

  useEffect(() => {
    if (placeFilter !== 'all' && !placeOptions.includes(placeFilter)) {
      setPlaceFilter('all')
    }
  }, [placeFilter, placeOptions])

  const menuTotals = useMemo(() => aggregateMenuTotals(rows), [rows])
  const byPlace = useMemo(() => groupRowsByDeliveryPlace(rows), [rows])
  const bySlot = useMemo(() => groupRowsBySlotAndPlace(rows), [rows])
  const mealsTotal = useMemo(
    () => rows.reduce((s, r) => s + r.count, 0),
    [rows],
  )

  const headline =
    dateFrom === dateTo
      ? formatYmd(dateFrom)
      : `Del ${formatYmd(dateFrom)} al ${formatYmd(dateTo)}`

  const onFromChange = (value) => {
    setDateFrom(value)
    if (dateTo && value > dateTo) setDateTo(value)
  }

  const onToChange = (value) => {
    setDateTo(value)
    if (dateFrom && value < dateFrom) setDateFrom(value)
  }

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
                Filtrá por rango y despachá almuerzo/cena por lugar.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!rows.length}
            onClick={() =>
              exportDayMenuExcel({
                dateLabel: headline,
                dateYmd: dateFrom === dateTo ? dateFrom : `${dateFrom}_${dateTo}`,
                menuTotals,
                detailRows: rows,
                byPlace,
                bySlot,
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
            <span className="text-sm font-medium text-slate-700">Desde</span>
            <input
              type="date"
              className={field}
              value={dateFrom}
              onChange={(e) => onFromChange(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hasta</span>
            <input
              type="date"
              className={field}
              value={dateTo}
              onChange={(e) => onToChange(e.target.value)}
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
          <p className="text-sm font-medium text-slate-500">
            Para {headline} necesitás preparar
          </p>
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
            No hay pedidos en este rango con estos filtros.
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

      {bySlot.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              Almuerzos y cenas por lugar
            </h4>
            <p className="text-sm text-slate-500">
              Qué viandas enviar a cada lugar, separado por servicio.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {bySlot.map((slotGroup) => {
              const isLunch = slotGroup.slot === 'lunch'
              const Icon = isLunch ? Sun : Moon
              return (
                <section
                  key={slotGroup.slot}
                  className={`rounded-xl border p-4 shadow-sm ${
                    isLunch
                      ? 'border-bordo-200 bg-bordo-50/40'
                      : 'border-lg-200 bg-lg-50'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h5
                      className={`flex items-center gap-2 text-lg font-semibold ${
                        isLunch ? 'text-bordo-800' : 'text-lg-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {slotGroup.label}s
                    </h5>
                    <span className="text-sm font-semibold tabular-nums text-slate-700">
                      {slotGroup.meals} viandas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {slotGroup.byPlace.map((placeGroup) => (
                      <div
                        key={`${slotGroup.slot}-${placeGroup.place}`}
                        className="rounded-lg border border-white/80 bg-white/90 p-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <MapPin className="h-4 w-4 text-bordo-600" />
                            Enviar a {placeGroup.place}
                          </p>
                          <p className="shrink-0 text-xs font-medium text-slate-500">
                            Total {placeGroup.meals}
                          </p>
                        </div>
                        <ul className="space-y-1">
                          {placeGroup.totals.map((item) => (
                            <li
                              key={`${slotGroup.slot}-${placeGroup.place}-${item.dishId}`}
                              className="flex items-baseline justify-between gap-3 text-sm"
                            >
                              <span className="min-w-0 truncate text-slate-700">
                                {item.name}
                              </span>
                              <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                                {item.count}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p
                          className={`mt-2 border-t border-stone-100 pt-2 text-sm font-semibold ${
                            isLunch ? 'text-bordo-800' : 'text-lg-800'
                          }`}
                        >
                          {placeGroup.meals} viandas → {placeGroup.place}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      {!byPlace.length ? null : (
        <div className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              Quién lo pidió
            </h4>
            <p className="text-sm text-slate-500">
              Detalle por lugar de entrega.
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
