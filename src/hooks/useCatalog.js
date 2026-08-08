import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createCompany,
  createDeliveryPlace,
  createDish,
  createForm,
  createOrder,
  deleteCompany,
  deleteDeliveryPlace,
  deleteDish,
  deleteForm,
  getCompanies,
  getDeliveryPlaces,
  getDishes,
  getFormById,
  getForms,
  getOrders,
  updateForm,
} from '../firebase/services'

async function safeLoad(loader, fallback = []) {
  try {
    return await loader()
  } catch (err) {
    console.error(err)
    return fallback
  }
}

export function useCatalog() {
  const [companies, setCompanies] = useState([])
  const [dishes, setDishes] = useState([])
  const [deliveryPlaces, setDeliveryPlaces] = useState([])
  const [forms, setForms] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }
    try {
      const [c, d, p, f, o] = await Promise.all([
        safeLoad(getCompanies),
        safeLoad(getDishes),
        safeLoad(getDeliveryPlaces),
        safeLoad(getForms),
        safeLoad(getOrders),
      ])
      setCompanies(c)
      setDishes(d)
      setDeliveryPlaces(p)
      setForms(f)
      setOrders(o)
    } catch (err) {
      console.error(err)
      if (!silent) setError(err.message || 'Error al cargar datos')
    } finally {
      if (!silent) setLoading(false)
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
    deliveryPlaces,
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
      setCompanies((prev) => {
        if (prev.some((c) => c.id === created.id)) {
          return prev.map((c) => (c.id === created.id ? created : c))
        }
        return [...prev, created].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'es'),
        )
      })
      await refresh()
      return created
    },
    async removeCompany(id) {
      await deleteCompany(id)
      setCompanies((prev) => prev.filter((c) => c.id !== id))
      await refresh()
    },
    async addDish(data) {
      const created = await createDish(data)
      setDishes((prev) => {
        if (prev.some((d) => d.id === created.id)) return prev
        return [...prev, created].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'es'),
        )
      })
      await refresh()
      return created
    },
    async removeDish(id) {
      await deleteDish(id)
      setDishes((prev) => prev.filter((d) => d.id !== id))
      await refresh()
    },
    async addDeliveryPlace(data) {
      const created = await createDeliveryPlace(data)
      setDeliveryPlaces((prev) => {
        if (prev.some((p) => p.id === created.id)) return prev
        return [...prev, created].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'es'),
        )
      })
      await refresh()
      return created
    },
    async removeDeliveryPlace(id) {
      await deleteDeliveryPlace(id)
      setDeliveryPlaces((prev) => prev.filter((p) => p.id !== id))
      await refresh()
    },
    async addForm(data) {
      const created = await createForm(data)
      setForms((prev) => [created, ...prev.filter((f) => f.id !== created.id)])
      await refresh()
      return created
    },
    async editForm(formId, patch) {
      const saved = await updateForm(formId, patch)
      if (saved) {
        setForms((prev) =>
          prev.map((f) => (f.id === formId ? saved : f)),
        )
      }
      await refresh()
      return saved
    },
    async removeForm(formId) {
      await deleteForm(formId)
      setForms((prev) => prev.filter((f) => f.id !== formId))
      await refresh()
    },
    async submitOrder(data) {
      const created = await createOrder(data)
      setOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)])
      refresh({ silent: true }).catch(() => {})
      return created
    },
    refresh,
  }
}
