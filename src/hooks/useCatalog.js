import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCompany,
  createDish,
  deleteDish,
  ensureLocalSeed,
  getCompanies,
  getDishes,
  getOrders,
  getWeeklyMenus,
  saveWeeklyMenu,
  seedDatabase,
  createOrder,
} from '../firebase/services'

export function useCatalog() {
  const [companies, setCompanies] = useState([])
  const [dishes, setDishes] = useState([])
  const [menus, setMenus] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await ensureLocalSeed()
      const [c, d, m, o] = await Promise.all([
        getCompanies(),
        getDishes(),
        getWeeklyMenus(),
        getOrders(),
      ])
      setCompanies(c)
      setDishes(d)
      setMenus(m)
      setOrders(o)
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

  const actions = {
    async addCompany(data) {
      const created = await createCompany(data)
      await refresh()
      return created
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
    async submitOrder(data) {
      const created = await createOrder(data)
      await refresh()
      return created
    },
    async seed() {
      await seedDatabase()
      await refresh()
    },
    refresh,
  }

  return {
    companies,
    dishes,
    menus,
    orders,
    dishesById,
    companiesById,
    getMenuFor,
    loading,
    error,
    ...actions,
  }
}
