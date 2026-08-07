export const DAYS = [
  { id: 'lun', label: 'Lunes', short: 'Lun' },
  { id: 'mar', label: 'Martes', short: 'Mar' },
  { id: 'mie', label: 'Miércoles', short: 'Mié' },
  { id: 'jue', label: 'Jueves', short: 'Jue' },
  { id: 'vie', label: 'Viernes', short: 'Vie' },
  { id: 'sab', label: 'Sábado', short: 'Sáb' },
  { id: 'dom', label: 'Domingo', short: 'Dom' },
]

export const DAY_IDS = DAYS.map((d) => d.id)

export const MEAL_SLOTS = {
  lunch: {
    key: 'lunch',
    label: 'Almuerzo',
    tone: 'lunch',
  },
  dinner: {
    key: 'dinner',
    label: 'Cena',
    tone: 'dinner',
  },
}

export const ORDER_DEADLINE = {
  hour: 10,
  minute: 30,
  label: '10:30 AM',
}

export const MAX_DISHES_PER_SLOT = 4

export function emptyDayDetails() {
  return {
    lunch: {},
    dinner: {},
    notes: { lunch: '', dinner: '' },
  }
}

export function emptyOrderDetails() {
  return Object.fromEntries(DAY_IDS.map((id) => [id, emptyDayDetails()]))
}

export function getDayLabel(dayId) {
  return DAYS.find((d) => d.id === dayId)?.label ?? dayId
}
