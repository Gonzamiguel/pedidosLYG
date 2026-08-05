const STORAGE_KEY = 'pedidos_lg_local_v2'

function defaultState() {
  return {
    companies: [],
    dishes: [],
    weekly_menus: [],
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
