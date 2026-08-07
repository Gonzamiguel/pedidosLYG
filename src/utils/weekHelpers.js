const DATE_FMT = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const LONG_FMT = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** YYYY-MM-DD en UTC calendario */
export function toDateInputValue(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Lunes de la semana (local) de una fecha */
export function mondayOf(date = new Date()) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay() // 0 dom … 6 sáb
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

/** Domingo a partir de un lunes (o de cualquier fecha → lunes+6) */
export function sundayFromStart(startYmd) {
  const d = parseYmd(startYmd)
  d.setDate(d.getDate() + 6)
  return toDateInputValue(d)
}

export function parseYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

export function formatYmd(ymd) {
  if (!ymd) return '—'
  return DATE_FMT.format(parseYmd(ymd))
}

export function formatYmdLong(ymd) {
  if (!ymd) return '—'
  return LONG_FMT.format(parseYmd(ymd))
}

export function weekLabel(week) {
  if (!week) return 'Sin semana'
  if (week.label?.trim()) return week.label.trim()
  return `${formatYmd(week.startDate)} → ${formatYmd(week.endDate)}`
}

export function weekRangeText(week) {
  if (!week) return ''
  return `Del ${formatYmd(week.startDate)} al ${formatYmd(week.endDate)}`
}

export function defaultWeekDraft() {
  const start = toDateInputValue(mondayOf(new Date()))
  return {
    startDate: start,
    endDate: sundayFromStart(start),
    label: '',
  }
}

export function validateWeekRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Indicá fecha desde y hasta'
  if (parseYmd(endDate) < parseYmd(startDate)) {
    return 'La fecha hasta debe ser posterior o igual a la fecha desde'
  }
  return ''
}

/** JS getDay() 0=dom … 6=sáb → ids del catálogo */
const DAY_ID_FROM_JS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']

export function dayIdFromYmd(ymd) {
  if (!ymd) return null
  return DAY_ID_FROM_JS[parseYmd(ymd).getDay()] ?? null
}

const TITLE_DATE_FMT = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

/** Ej: "viernes 7/8/2026" */
export function formatYmdTitle(ymd) {
  if (!ymd) return '—'
  const raw = TITLE_DATE_FMT.format(parseYmd(ymd))
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function ymdInRange(ymd, startDate, endDate) {
  if (!ymd || !startDate || !endDate) return false
  return ymd >= startDate && ymd <= endDate
}
