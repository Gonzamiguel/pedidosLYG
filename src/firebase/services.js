import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { loadLocalState, updateLocalCollection } from './localStore'
import { normalizeFormDays } from '../data/formHelpers'

function toIso(value) {
  if (!value) return new Date().toISOString()
  if (typeof value === 'string') return value
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value?.toDate) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  return new Date().toISOString()
}

function normalizeDoc(id, data) {
  return {
    id,
    ...data,
    createdAt: toIso(data.createdAt),
  }
}

/* ───────────── Companies ───────────── */

export async function getCompanies() {
  if (!isFirebaseConfigured) return loadLocalState().companies
  try {
    const snap = await getDocs(
      query(collection(db, 'companies'), orderBy('name')),
    )
    return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
  } catch (err) {
    // Fallback si falta índice o hay docs sin campo name
    console.warn('getCompanies orderBy falló, reintento sin orden', err)
    const snap = await getDocs(collection(db, 'companies'))
    return snap.docs
      .map((d) => normalizeDoc(d.id, d.data()))
      .sort((a, b) => (a.name || a.code || '').localeCompare(b.name || b.code || '', 'es'))
  }
}

export async function createCompany({ code, name }) {
  const id = code.toLowerCase().replace(/[^a-z0-9]/g, '')
  const payload = {
    code: code.toUpperCase(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  }
  if (!id) throw new Error('El código de empresa no es válido')

  if (!isFirebaseConfigured) {
    const list = updateLocalCollection('companies', (items) => {
      if (items.some((c) => c.id === id || c.code === payload.code)) {
        throw new Error('Ya existe una empresa con ese código')
      }
      return [...items, { id, ...payload }]
    })
    return list.find((c) => c.id === id)
  }

  await setDoc(doc(db, 'companies', id), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id, ...payload }
}

export async function deleteCompany(companyId) {
  if (!isFirebaseConfigured) {
    updateLocalCollection('companies', (items) =>
      items.filter((c) => c.id !== companyId),
    )
    updateLocalCollection('forms', (items) =>
      items.filter((f) => f.companyId !== companyId),
    )
    return
  }

  await deleteDoc(doc(db, 'companies', companyId))
  const forms = await getDocs(collection(db, 'forms'))
  await Promise.all(
    forms.docs
      .filter((d) => d.data().companyId === companyId)
      .map((d) => deleteDoc(d.ref)),
  )
}

/* ───────────── Dishes ───────────── */

export async function getDishes() {
  if (!isFirebaseConfigured) return loadLocalState().dishes
  try {
    const snap = await getDocs(query(collection(db, 'dishes'), orderBy('name')))
    return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
  } catch (err) {
    console.warn('getDishes orderBy falló, reintento sin orden', err)
    const snap = await getDocs(collection(db, 'dishes'))
    return snap.docs
      .map((d) => normalizeDoc(d.id, d.data()))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'))
  }
}

export async function createDish({ name }) {
  const payload = {
    name: name.trim(),
    createdAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured) {
    const id = `dish_${Date.now()}`
    updateLocalCollection('dishes', (items) => [...items, { id, ...payload }])
    return { id, ...payload }
  }

  const ref = await addDoc(collection(db, 'dishes'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...payload }
}

export async function deleteDish(dishId) {
  if (!isFirebaseConfigured) {
    updateLocalCollection('dishes', (items) => items.filter((d) => d.id !== dishId))
    return
  }
  await deleteDoc(doc(db, 'dishes', dishId))
}

/* ───────────── Delivery places ───────────── */

export async function getDeliveryPlaces() {
  if (!isFirebaseConfigured) return loadLocalState().deliveryPlaces || []
  try {
    const snap = await getDocs(
      query(collection(db, 'deliveryPlaces'), orderBy('name')),
    )
    return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
  } catch (err) {
    console.warn('getDeliveryPlaces orderBy falló, reintento sin orden', err)
    const snap = await getDocs(collection(db, 'deliveryPlaces'))
    return snap.docs
      .map((d) => normalizeDoc(d.id, d.data()))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'))
  }
}

export async function createDeliveryPlace({ name }) {
  const payload = {
    name: name.trim(),
    createdAt: new Date().toISOString(),
  }
  if (!payload.name) throw new Error('El nombre del lugar es obligatorio')

  if (!isFirebaseConfigured) {
    const id = `place_${Date.now()}`
    updateLocalCollection('deliveryPlaces', (items) => {
      if (items.some((p) => p.name.toLowerCase() === payload.name.toLowerCase())) {
        throw new Error('Ya existe un lugar con ese nombre')
      }
      return [...items, { id, ...payload }]
    })
    return { id, ...payload }
  }

  const ref = await addDoc(collection(db, 'deliveryPlaces'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...payload }
}

export async function deleteDeliveryPlace(placeId) {
  if (!isFirebaseConfigured) {
    updateLocalCollection('deliveryPlaces', (items) =>
      items.filter((p) => p.id !== placeId),
    )
    return
  }
  await deleteDoc(doc(db, 'deliveryPlaces', placeId))
}

/* ───────────── Forms (empresa + fechas + menús) ───────────── */

export async function getForms() {
  if (!isFirebaseConfigured) {
    const forms = loadLocalState().forms || []
    return [...forms]
      .map((f) => ({ ...f, days: normalizeFormDays(f.days) }))
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
  }

  const snap = await getDocs(collection(db, 'forms'))
  return snap.docs
    .map((d) => {
      const data = normalizeDoc(d.id, d.data())
      return { ...data, days: normalizeFormDays(data.days) }
    })
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
}

export async function getFormById(formId) {
  if (!formId) return null

  if (!isFirebaseConfigured) {
    const form = (loadLocalState().forms || []).find((f) => f.id === formId)
    return form ? { ...form, days: normalizeFormDays(form.days) } : null
  }

  const snap = await getDoc(doc(db, 'forms', formId))
  if (!snap.exists()) return null
  const data = normalizeDoc(snap.id, snap.data())
  return { ...data, days: normalizeFormDays(data.days) }
}

export async function createForm({
  companyId,
  startDate,
  endDate,
  days,
  status = 'open',
}) {
  const payload = {
    companyId,
    startDate,
    endDate,
    days: normalizeFormDays(days),
    status,
    createdAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured) {
    const id = `form_${Date.now()}`
    updateLocalCollection('forms', (items) => [{ id, ...payload }, ...items])
    return { id, ...payload }
  }

  const ref = await addDoc(collection(db, 'forms'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...payload }
}

export async function updateForm(formId, patch) {
  const clean = { ...patch }
  if (clean.days) clean.days = normalizeFormDays(clean.days)

  if (!isFirebaseConfigured) {
    updateLocalCollection('forms', (items) =>
      items.map((f) => (f.id === formId ? { ...f, ...clean } : f)),
    )
    const form = (loadLocalState().forms || []).find((f) => f.id === formId)
    return form ? { ...form, days: normalizeFormDays(form.days) } : null
  }

  await setDoc(doc(db, 'forms', formId), clean, { merge: true })
  return getFormById(formId)
}

export async function deleteForm(formId) {
  if (!isFirebaseConfigured) {
    updateLocalCollection('forms', (items) =>
      items.filter((f) => f.id !== formId),
    )
    return
  }
  await deleteDoc(doc(db, 'forms', formId))
}

/* ───────────── Orders ───────────── */

export async function getOrders() {
  if (!isFirebaseConfigured) return loadLocalState().orders
  const snap = await getDocs(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
}

export async function createOrder(order) {
  const lunch = (order.deliveryPlaceLunch || '').trim()
  const dinner = (order.deliveryPlaceDinner || '').trim()
  const legacySector =
    lunch && dinner && lunch !== dinner
      ? `Almuerzo: ${lunch} · Cena: ${dinner}`
      : lunch || dinner || (order.userSector || '').trim()

  const payload = {
    companyId: order.companyId,
    formId: order.formId || '',
    weekStart: order.weekStart || '',
    weekEnd: order.weekEnd || '',
    userName: order.userName.trim(),
    userSector: legacySector,
    deliveryPlaceLunch: lunch,
    deliveryPlaceDinner: dinner,
    userPhone: order.userPhone.trim(),
    totalMeals: order.totalMeals,
    details: order.details,
    createdAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured) {
    const id = `ord_${Date.now()}`
    updateLocalCollection('orders', (items) => [{ id, ...payload }, ...items])
    return { id, ...payload }
  }

  const ref = await addDoc(collection(db, 'orders'), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...payload }
}

export function getDataMode() {
  return isFirebaseConfigured ? 'firebase' : 'local'
}
