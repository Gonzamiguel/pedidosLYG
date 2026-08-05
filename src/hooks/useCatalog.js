import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCompany,
  createDish,
  createWeek,
  deleteCompany,
  deleteDish,
  deleteWeek,
  getCompanies,
  getDishes,
  getOrders,
  getWeeks,
  getWeeklyMenus,
  saveWeeklyMenu,
  setWeekStatus,
  createOrder,
} from '../firebase/services'

export function useCatalog() {
  const [companies, setCompanies] = useState([])
  const [dishes, setDishes] = useState([])
  const [menus, setMenus] = useState([])
  const [weeks, setWeeks] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, d, m, w] = await Promise.all([
        getCompanies(),
        getDishes(),
        getWeeklyMenus(),
        getWeeks(),
      ])
      setCompanies(c)
      setDishes(d)
      setMenus(m)
      setWeeks(w)

      try {
        const o = await getOrders()
        setOrders(o)
      } catch {
        setOrders([])
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const dishesById = useMemo(
    () => Object.fromEntries(dishes.map((d) => [d.id, d])),
    [dishes],
  )

  const companiesById = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies],
  )

  const weeksById = useMemo(
    () => Object.fromEntries(weeks.map((w) => [w.id, w])),
    [weeks],
  )

  const getMenuFor = useCallback(
    (companyId, dayId) =>
      menus.find((m) => m.companyId === companyId && m.dayId === dayId) || {
        companyId,
        dayId,
        lunch: [],
        dinner: [],
      },
    [menus],
  )

  const getActiveWeek = useCallback(
    (companyId) =>
      weeks.find((w) => w.companyId === companyId && w.status === 'active') ||
      null,
    [weeks],
  )

  return {
    companies,
    dishes,
    menus,
    weeks,
    orders,
    dishesById,
    companiesById,
    weeksById,
    getMenuFor,
    getActiveWeek,
    loading,
    error,
    async addCompany(data) {
      const created = await createCompany(data)
      await refresh()
      return created
    },
    async removeCompany(id) {
      await deleteCompany(id)
      await refresh()
    },
    async addDish(data) {
      const created = await createDish(data)
      await refresh()
      return created
    },
    async removeDish(id) {
      await deleteDish(id)
      await refresh()
    },
    async updateMenu(data) {
      const saved = await saveWeeklyMenu(data)
      await refresh()
      return saved
    },
    async addWeek(data) {
      const created = await createWeek(data)
      await refresh()
      return created
    },
    async changeWeekStatus(weekId, status) {
      await setWeekStatus(weekId, status)
      await refresh()
    },
    async removeWeek(weekId) {
      await deleteWeek(weekId)
      await refresh()
    },
    async submitOrder(data) {
      const created = await createOrder(data)
      try {
        await refresh()
      } catch {
        /* ignore */
      }
      return created
    },
    refresh,
  }
}
