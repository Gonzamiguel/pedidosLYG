import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { loadLocalState, updateLocalCollection } from './localStore'

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
  if (!isFirebaseConfigured) {
    return loadLocalState().companies
  }
  const snap = await getDocs(query(collection(db, 'companies'), orderBy('name')))
  return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
}

export async function createCompany({ code, name }) {
  const id = code.toLowerCase().replace(/[^a-z0-9]/g, '')
  const payload = {
    code: code.toUpperCase(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  }

  if (!id) {
    throw new Error('El código de empresa no es válido')
  }

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
    updateLocalCollection('weekly_menus', (items) =>
      items.filter((m) => m.companyId !== companyId),
    )
    return
  }

  await deleteDoc(doc(db, 'companies', companyId))
  const menus = await getDocs(collection(db, 'weekly_menus'))
  await Promise.all(
    menus.docs
      .filter((d) => d.data().companyId === companyId)
      .map((d) => deleteDoc(d.ref)),
  )
}

/* ───────────── Dishes ───────────── */

export async function getDishes() {
  if (!isFirebaseConfigured) {
    return loadLocalState().dishes
  }
  const snap = await getDocs(query(collection(db, 'dishes'), orderBy('name')))
  return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
}

export async function createDish({ name, tag, desc }) {
  const payload = {
    name: name.trim(),
    tag,
    desc: (desc || '').trim(),
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

/* ───────────── Weekly Menus ───────────── */

export async function getWeeklyMenus(companyId) {
  if (!isFirebaseConfigured) {
    const menus = loadLocalState().weekly_menus
    return companyId ? menus.filter((m) => m.companyId === companyId) : menus
  }

  const snap = await getDocs(collection(db, 'weekly_menus'))
  const menus = snap.docs.map((d) => normalizeDoc(d.id, d.data()))
  return companyId ? menus.filter((m) => m.companyId === companyId) : menus
}

export async function saveWeeklyMenu({ companyId, dayId, lunch, dinner }) {
  const id = `${companyId}_${dayId}`
  const payload = {
    companyId,
    dayId,
    lunch: lunch.slice(0, 4),
    dinner: dinner.slice(0, 4),
    createdAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured) {
    updateLocalCollection('weekly_menus', (items) => {
      const rest = items.filter((m) => m.id !== id)
      return [...rest, { id, ...payload }]
    })
    return { id, ...payload }
  }

  await setDoc(
    doc(db, 'weekly_menus', id),
    { ...payload, createdAt: serverTimestamp() },
    { merge: true },
  )
  return { id, ...payload }
}

/* ───────────── Orders ───────────── */

export async function getOrders() {
  if (!isFirebaseConfigured) {
    return loadLocalState().orders
  }
  const snap = await getDocs(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => normalizeDoc(d.id, d.data()))
}

export async function createOrder(order) {
  const payload = {
    companyId: order.companyId,
    userName: order.userName.trim(),
    userSector: order.userSector.trim(),
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
