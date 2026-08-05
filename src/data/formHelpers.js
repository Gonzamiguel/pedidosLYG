import { DAY_IDS, DAYS, MAX_DISHES_PER_SLOT } from './constants'

export function emptyFormDays() {
  return Object.fromEntries(
    DAY_IDS.map((id) => [id, { lunch: [], dinner: [] }]),
  )
}

export function normalizeFormDays(days = {}) {
  const base = emptyFormDays()
  for (const dayId of DAY_IDS) {
    base[dayId] = {
      lunch: Array.isArray(days?.[dayId]?.lunch)
        ? days[dayId].lunch.slice(0, MAX_DISHES_PER_SLOT)
        : [],
      dinner: Array.isArray(days?.[dayId]?.dinner)
        ? days[dayId].dinner.slice(0, MAX_DISHES_PER_SLOT)
        : [],
    }
  }
  return base
}

/** Días del formulario según fechas (mapea fechas reales a lun-dom) */
export function dayIdsInRange(startDate, endDate) {
  if (!startDate || !endDate) return DAY_IDS
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return DAY_IDS

  const map = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
  const found = new Set()
  const cursor = new Date(start)
  let guard = 0
  while (cursor <= end && guard < 31) {
    found.add(map[cursor.getDay()])
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return DAYS.filter((d) => found.has(d.id)).map((d) => d.id)
}

export function formTitle(form, company) {
  const code = company?.code || form.companyId
  return `${code} · ${form.startDate} → ${form.endDate}`
}
