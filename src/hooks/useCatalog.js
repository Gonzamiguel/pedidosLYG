import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCompany,
  createDish,
  createForm,
  createOrder,
  deleteCompany,
  deleteDish,
  deleteForm,
  getCompanies,
  getDishes,
  getFormById,
  getForms,
  getOrders,
  updateForm,
} from '../firebase/services'

export function useCatalog() {
  const [companies, setCompanies] = useState([])
  const [dishes, setDishes] = useState([])
  const [forms, setForms] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, d, f] = await Promise.all([
        getCompanies(),
        getDishes(),
        getForms(),
      ])
      setCompanies(c)
      setDishes(d)
      setForms(f)
      try {
        setOrders(await getOrders())
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
  const formsById = useMemo(
    () => Object.fromEntries(forms.map((f) => [f.id, f])),
    [forms],
  )

  return {
    companies,
    dishes,
    forms,
    orders,
    dishesById,
    companiesById,
    formsById,
    loading,
    error,
    getFormById,
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
    async addForm(data) {
      const created = await createForm(data)
      await refresh()
      return created
    },
    async editForm(formId, patch) {
      const saved = await updateForm(formId, patch)
      await refresh()
      return saved
    },
    async removeForm(formId) {
      await deleteForm(formId)
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
