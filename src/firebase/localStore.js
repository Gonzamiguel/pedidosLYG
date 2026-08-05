import {
  SEED_COMPANIES,
  SEED_DISHES,
  SEED_MENUS,
  withTimestamps,
} from '../data/seed'

const STORAGE_KEY = 'viandapp_local_v1'

function defaultState() {
  const now = Date.now()
  return {
    companies: withTimestamps(SEED_COMPANIES, now),
    dishes: withTimestamps(SEED_DISHES, now),
    weekly_menus: withTimestamps(SEED_MENUS, now),
    orders: [],
  }
}

export function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const state = defaultState()
      saveLocalState(state)
      return state
    }
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export function saveLocalState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetLocalState() {
  const state = defaultState()
  saveLocalState(state)
  return state
}

export function updateLocalCollection(collection, updater) {
  const state = loadLocalState()
  state[collection] = updater(state[collection] || [])
  saveLocalState(state)
  return state[collection]
}
