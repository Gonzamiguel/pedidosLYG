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
      'Sector',
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

/** Export Menú del día: hoja de totales + hoja de registros, ambos en columnas */
export function exportDayMenuExcel({ dateLabel, dateYmd, menuTotals, detailRows }) {
  const stamp = dateYmd || new Date().toISOString().slice(0, 10)
  const fecha = dateLabel || stamp

  // Archivo 1 mentalmente: todo en un CSV ordenado por bloques de tablas limpias
  const rows = [
    ['Fecha', fecha],
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

  rows.push([])
  rows.push(['REGISTROS DEL DÍA'])
  rows.push([
    'Empresa',
    'Quién pidió',
    'Sector',
    'Teléfono',
    'Servicio',
    'Cantidad y plato',
    'Cantidad',
    'Plato',
    'Cargado',
  ])

  for (const row of detailRows) {
    rows.push([
      row.companyCode,
      row.userName,
      row.userSector || '',
      row.userPhone || '',
      row.slotLabel,
      cantidadYPlato(row.count, row.dishName),
      String(row.count),
      row.dishName,
      row.createdAtLabel || '',
    ])
  }

  downloadCsv(rows, `menu-del-dia-${stamp}.csv`)
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
