import { DAYS, DAY_IDS, MEAL_SLOTS, ORDER_DEADLINE } from '../data/constants'
import { weekRangeText } from './weekHelpers'

export function countSlotMeals(slotMap = {}) {
  return Object.values(slotMap).reduce((sum, n) => sum + (Number(n) || 0), 0)
}

export function countDayMeals(dayDetails) {
  if (!dayDetails) return 0
  return countSlotMeals(dayDetails.lunch) + countSlotMeals(dayDetails.dinner)
}

export function countTotalMeals(details) {
  return DAY_IDS.reduce((sum, dayId) => sum + countDayMeals(details?.[dayId]), 0)
}

export function setDishCount(details, dayId, slot, dishId, count) {
  const next = structuredClone(details)
  if (!next[dayId]) {
    next[dayId] = {
      lunch: {},
      dinner: {},
      notes: { lunch: '', dinner: '' },
    }
  }
  const value = Math.max(0, Math.min(999, Number(count) || 0))
  if (value === 0) {
    delete next[dayId][slot][dishId]
  } else {
    next[dayId][slot][dishId] = value
  }
  return next
}

export function setDayNote(details, dayId, slot, note) {
  const next = structuredClone(details)
  if (!next[dayId]) {
    next[dayId] = {
      lunch: {},
      dinner: {},
      notes: { lunch: '', dinner: '' },
    }
  }
  if (!next[dayId].notes) next[dayId].notes = { lunch: '', dinner: '' }
  next[dayId].notes[slot] = note
  return next
}

export function isPastDeadline(date = new Date()) {
  const limit = new Date(date)
  limit.setHours(ORDER_DEADLINE.hour, ORDER_DEADLINE.minute, 0, 0)
  return date > limit
}

export function buildWhatsAppMessage({
  company,
  week,
  userName,
  userSector,
  userPhone,
  details,
  dishesById,
}) {
  const lines = [
    `*Pedidos Logística y Gastronomía*`,
    `Empresa: ${company?.code || ''} — ${company?.name || ''}`,
  ]
  if (week) {
    lines.push(`Semana: ${weekRangeText(week)}`)
  }
  lines.push(
    `Solicitante: ${userName}`,
    `Sector: ${userSector}`,
    `Tel: ${userPhone}`,
    ``,
  )

  for (const day of DAYS) {
    const dayDetails = details[day.id]
    const dayTotal = countDayMeals(dayDetails)
    if (!dayTotal) continue

    lines.push(`*${day.label}* (${dayTotal} viandas)`)

    for (const slot of ['lunch', 'dinner']) {
      const slotMap = dayDetails?.[slot] || {}
      const entries = Object.entries(slotMap).filter(([, n]) => Number(n) > 0)
      if (!entries.length) continue

      lines.push(`  ${MEAL_SLOTS[slot].label}:`)
      for (const [dishId, count] of entries) {
        const dishName = dishesById[dishId]?.name || dishId
        lines.push(`  • ${count}x ${dishName}`)
      }
      const note = dayDetails?.notes?.[slot]
      if (note?.trim()) {
        lines.push(`  Obs: ${note.trim()}`)
      }
    }
    lines.push('')
  }

  lines.push(`*Total: ${countTotalMeals(details)} viandas*`)
  return lines.join('\n')
}

export function buildWhatsAppUrl(message, phone = '') {
  const text = encodeURIComponent(message)
  const digits = phone.replace(/\D/g, '')
  if (digits) {
    return `https://wa.me/${digits}?text=${text}`
  }
  return `https://wa.me/?text=${text}`
}

/**
 * Consolida pedidos en un mapa:
 * { lun: { lunch: { dishId: count }, dinner: { ... } }, ... }
 */
export function consolidateOrders(
  orders,
  companyFilter = 'all',
  weekFilter = 'all',
) {
  const result = Object.fromEntries(
    DAY_IDS.map((id) => [id, { lunch: {}, dinner: {} }]),
  )

  let totalOrders = 0
  let lunchTotal = 0
  let dinnerTotal = 0

  for (const order of orders) {
    if (companyFilter !== 'all' && order.companyId !== companyFilter) continue
    if (weekFilter !== 'all' && order.weekId !== weekFilter) continue
    totalOrders += 1

    for (const dayId of DAY_IDS) {
      const day = order.details?.[dayId]
      if (!day) continue

      for (const slot of ['lunch', 'dinner']) {
        for (const [dishId, count] of Object.entries(day[slot] || {})) {
          const n = Number(count) || 0
          if (!n) continue
          result[dayId][slot][dishId] = (result[dayId][slot][dishId] || 0) + n
          if (slot === 'lunch') lunchTotal += n
          else dinnerTotal += n
        }
      }
    }
  }

  return {
    byDay: result,
    metrics: {
      totalOrders,
      lunchTotal,
      dinnerTotal,
      grandTotal: lunchTotal + dinnerTotal,
    },
  }
}

export function exportKitchenCsv(consolidated, dishesById, companyLabel) {
  const rows = [['Empresa', 'Día', 'Turno', 'Plato', 'Cantidad']]

  for (const day of DAYS) {
    for (const slot of ['lunch', 'dinner']) {
      const map = consolidated.byDay[day.id][slot]
      const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
      for (const [dishId, count] of entries) {
        rows.push([
          companyLabel,
          day.label,
          MEAL_SLOTS[slot].label,
          dishesById[dishId]?.name || dishId,
          String(count),
        ])
      }
    }
  }

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pedidos-lg-cocina-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
