import { DAYS, DAY_IDS, MEAL_SLOTS, ORDER_DEADLINE } from '../data/constants'

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

export function countAllSlotMeals(details, slot) {
  return DAY_IDS.reduce(
    (sum, dayId) => sum + countSlotMeals(details?.[dayId]?.[slot]),
    0,
  )
}

/** Lugar de entrega según servicio (con fallback a pedidos viejos) */
export function deliveryPlaceForSlot(order, slot) {
  if (slot === 'lunch') {
    return (
      (order.deliveryPlaceLunch || order.userSector || '').trim() || 'Sin lugar'
    )
  }
  return (
    (order.deliveryPlaceDinner || order.userSector || '').trim() || 'Sin lugar'
  )
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

export function isPastDeadline(date = new Date()) {
  const limit = new Date(date)
  limit.setHours(ORDER_DEADLINE.hour, ORDER_DEADLINE.minute, 0, 0)
  return date > limit
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

  downloadCsv(rows, `pedidos-lg-cocina-${new Date().toISOString().slice(0, 10)}.csv`)
}

/** Descarga CSV UTF-8 (abre bien en Excel) */
export function downloadCsv(rows, filename) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'),
    )
    .join('\r\n')

  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function cantidadYPlato(count, dishName) {
  return `${count} ${dishName}`.trim()
}

export function exportConsolidatedExcel(detailRows) {
  const rows = [
    [
      'Empresa',
      'Quién pidió',
      'Lugar de entrega',
      'Teléfono',
      'Día',
      'Servicio',
      'Cantidad y plato',
      'Cantidad',
      'Plato',
      'Período',
      'Cargado',
    ],
  ]

  for (const row of detailRows) {
    rows.push([
      row.companyCode,
      row.userName,
      row.userSector || '',
      row.userPhone || '',
      row.dayLabel,
      row.slotLabel,
      cantidadYPlato(row.count, row.dishName),
      String(row.count),
      row.dishName,
      row.periodLabel || '',
      row.createdAtLabel || '',
    ])
  }

  downloadCsv(
    rows,
    `consolidado-pedidos-${new Date().toISOString().slice(0, 10)}.csv`,
  )
}

export function aggregateMenuTotals(detailRows) {
  const map = new Map()
  for (const row of detailRows) {
    const prev = map.get(row.dishId)
    if (prev) {
      prev.count += row.count
    } else {
      map.set(row.dishId, {
        dishId: row.dishId,
        name: row.dishName,
        count: row.count,
      })
    }
  }
  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name, 'es')
  })
}

/** Agrupa filas por lugar de entrega (para despacho) */
export function groupRowsByDeliveryPlace(detailRows) {
  const map = new Map()
  for (const row of detailRows) {
    const place = (row.userSector || '').trim() || 'Sin lugar'
    if (!map.has(place)) map.set(place, [])
    map.get(place).push(row)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([place, placeRows]) => ({
      place,
      rows: placeRows,
      totals: aggregateMenuTotals(placeRows),
      meals: placeRows.reduce((s, r) => s + r.count, 0),
    }))
}

/** Cards Almuerzo / Cena → dentro, por lugar */
export function groupRowsBySlotAndPlace(detailRows) {
  const slots = ['lunch', 'dinner']
  return slots
    .map((slot) => {
      const slotRows = detailRows.filter((r) => r.slot === slot)
      const byPlace = groupRowsByDeliveryPlace(slotRows)
      return {
        slot,
        label: MEAL_SLOTS[slot].label,
        meals: slotRows.reduce((s, r) => s + r.count, 0),
        totals: aggregateMenuTotals(slotRows),
        byPlace,
      }
    })
    .filter((block) => block.meals > 0)
}

/** Export Menú del día: totales + por servicio/lugar + registros */
export function exportDayMenuExcel({
  dateLabel,
  dateYmd,
  menuTotals,
  detailRows,
  byPlace = [],
  bySlot = [],
}) {
  const stamp = dateYmd || new Date().toISOString().slice(0, 10)
  const fecha = dateLabel || stamp
  const placeGroups =
    byPlace.length > 0 ? byPlace : groupRowsByDeliveryPlace(detailRows)
  const slotGroups =
    bySlot.length > 0 ? bySlot : groupRowsBySlotAndPlace(detailRows)

  const rows = [
    ['Período', fecha],
    [],
    ['TOTALES A PREPARAR'],
    ['Cantidad y plato', 'Cantidad', 'Plato'],
  ]

  for (const item of menuTotals) {
    rows.push([
      cantidadYPlato(item.count, item.name),
      String(item.count),
      item.name,
    ])
  }

  const mealsTotal = menuTotals.reduce((s, i) => s + i.count, 0)
  rows.push([
    cantidadYPlato(mealsTotal, 'viandas (total)'),
    String(mealsTotal),
    'TOTAL',
  ])

  for (const slotGroup of slotGroups) {
    rows.push([])
    rows.push([slotGroup.label.toUpperCase()])
    for (const placeGroup of slotGroup.byPlace) {
      rows.push([`Enviar a: ${placeGroup.place}`])
      rows.push(['Cantidad y plato', 'Cantidad', 'Plato'])
      for (const item of placeGroup.totals) {
        rows.push([
          cantidadYPlato(item.count, item.name),
          String(item.count),
          item.name,
        ])
      }
      rows.push([
        cantidadYPlato(placeGroup.meals, 'viandas'),
        String(placeGroup.meals),
        `Total a ${placeGroup.place}`,
      ])
    }
  }

  for (const group of placeGroups) {
    rows.push([])
    rows.push([`REGISTROS — ${group.place}`])
    rows.push([
      'Empresa',
      'Quién pidió',
      'Lugar de entrega',
      'Teléfono',
      'Servicio',
      'Cantidad y plato',
      'Cantidad',
      'Plato',
      'Cargado',
    ])
    for (const row of group.rows) {
      rows.push([
        row.companyCode,
        row.userName,
        row.userSector || group.place,
        row.userPhone || '',
        row.slotLabel,
        cantidadYPlato(row.count, row.dishName),
        String(row.count),
        row.dishName,
        row.createdAtLabel || '',
      ])
    }
  }

  downloadCsv(rows, `menu-del-dia-${stamp}.csv`)
}
