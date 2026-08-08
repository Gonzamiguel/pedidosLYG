import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
} from 'lucide-react'
import { DAYS, DAY_IDS, MEAL_SLOTS } from '../../data/constants'
import {
  deliveryPlaceForSlot,
  exportConsolidatedExcel,
} from '../../utils/orderHelpers'
import { formatDateTime, weekRangeText } from '../../utils/weekHelpers'

const PAGE_SIZE = 10

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
  const [slotFilter, setSlotFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState(currentYear)
  const [page, setPage] = useState(1)

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

  const rows = useMemo(() => {
    const list = []
    for (const order of filteredOrders) {
      const company = companiesById[order.companyId]
      const periodLabel = order.weekStart
        ? weekRangeText({
            startDate: order.weekStart,
            endDate: order.weekEnd,
          })
        : formsById[order.formId]
          ? weekRangeText(formsById[order.formId])
          : '—'

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
              companyCode: company?.code || order.companyId,
              companyName: company?.name || '',
              userName: order.userName,
              userSector: deliveryPlaceForSlot(order, slot),
              userPhone: order.userPhone,
              dayId: day.id,
              dayLabel: day.label,
              slot,
              slotLabel: MEAL_SLOTS[slot].label,
              dishId,
              dishName: dishesById[dishId]?.name || dishId,
              count: Number(count),
              periodLabel,
              createdAt: order.createdAt,
              createdAtLabel: formatDateTime(order.createdAt),
            })
          }
        }
      }
    }

    return list.sort((a, b) => {
      const placeCmp = (a.userSector || '').localeCompare(b.userSector || '', 'es')
      if (placeCmp !== 0) return placeCmp
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
    formsById,
  ])

  const totals = useMemo(() => {
    return {
      people: new Set(filteredOrders.map((o) => o.id)).size,
      lines: rows.length,
      meals: rows.reduce((s, r) => s + r.count, 0),
    }
  }, [filteredOrders, rows])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [companyFilter, slotFilter, dayFilter, monthFilter, yearFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return rows.slice(start, start + PAGE_SIZE)
  }, [rows, page])

  const rangeStart = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = Math.min(page * PAGE_SIZE, rows.length)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Consolidado completo
              </h3>
              <p className="text-sm text-slate-500">
                Todos los pedidos filtrados, con export a Excel.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!rows.length}
            onClick={() => exportConsolidatedExcel(rows)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-bordo-700 px-4 text-sm font-semibold text-white hover:bg-bordo-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
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
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Quién pidió</th>
                    <th className="px-4 py-3">Lugar de entrega</th>
                    <th className="px-4 py-3">Día</th>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3">Plato</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Cargado</th>
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
                        {row.userPhone ? (
                          <p className="text-xs text-slate-500">
                            {row.userPhone}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {row.userSector || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.dayLabel}</td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-slate-800">{row.dishName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {row.periodLabel}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-slate-500">
                        {row.createdAtLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              total={rows.length}
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
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

function PaginationBar({
  rangeStart,
  rangeEnd,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Mostrando {rangeStart}–{rangeEnd} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
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
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
