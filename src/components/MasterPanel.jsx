import { useState } from 'react'
import {
  Building2,
  ClipboardList,
  Database,
  Lock,
  LogOut,
  Utensils,
  X,
  CalendarRange,
} from 'lucide-react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { useEffect } from 'react'
import { auth, ADMIN_DEMO_KEY, ADMIN_EMAIL, isFirebaseConfigured } from '../firebase/config'
import { getDataMode } from '../firebase/services'
import DishesTab from './admin/DishesTab'
import MenuConfigTab from './admin/MenuConfigTab'
import CompaniesTab from './admin/CompaniesTab'
import ConsolidatedTab from './admin/ConsolidatedTab'

const TABS = [
  { id: 'dishes', label: 'Platos', icon: Utensils },
  { id: 'menus', label: 'Config. Menú', icon: CalendarRange },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'report', label: 'Consolidado', icon: ClipboardList },
]

export default function MasterPanel({ open, onClose, catalog }) {
  const [tab, setTab] = useState('dishes')
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState(ADMIN_EMAIL || '')
  const [password, setPassword] = useState('')
  const [demoKey, setDemoKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return undefined
    return onAuthStateChanged(auth, (user) => {
      if (user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL)) {
        setAuthed(true)
      }
    })
  }, [])

  if (!open) return null

  const loginFirebase = async (e) => {
    e.preventDefault()
    if (!isFirebaseConfigured) return
    setBusy(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      if (ADMIN_EMAIL && cred.user.email !== ADMIN_EMAIL) {
        await signOut(auth)
        throw new Error('Este usuario no es Master Admin')
      }
      setAuthed(true)
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setBusy(false)
    }
  }

  const loginDemo = (e) => {
    e.preventDefault()
    if (demoKey.trim() === ADMIN_DEMO_KEY) {
      setAuthed(true)
      setError('')
    } else {
      setError('Clave incorrecta')
    }
  }

  const logout = async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await signOut(auth)
    }
    setAuthed(false)
    setPassword('')
    setDemoKey('')
  }

  const handleSeed = async () => {
    setSeedMsg('')
    try {
      await catalog.seed()
      setSeedMsg('Datos semilla cargados correctamente')
    } catch (err) {
      setSeedMsg(err.message || 'Error al cargar seed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/60">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-slate-900 text-slate-100 shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Master Admin
            </p>
            <h2 className="font-display text-xl font-bold text-white">
              Panel de Administración
            </h2>
            <p className="text-xs text-slate-400">
              Modo: {getDataMode() === 'local' ? 'Demo local' : 'Firebase'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {authed && (
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-800 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!authed ? (
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
              <div className="mb-4 flex items-center gap-2 text-amber-400">
                <Lock className="h-5 w-5" />
                <h3 className="font-semibold">Acceso restringido</h3>
              </div>

              {isFirebaseConfigured ? (
                <form onSubmit={loginFirebase} className="space-y-3">
                  <label className="block">
                    <span className="text-xs text-slate-400">Email</span>
                    <input
                      type="email"
                      className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm outline-none focus:border-amber-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-400">Contraseña</span>
                    <input
                      type="password"
                      className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm outline-none focus:border-amber-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>
                  {error && <p className="text-xs text-rose-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-11 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
                  >
                    Ingresar con Firebase Auth
                  </button>
                </form>
              ) : (
                <form onSubmit={loginDemo} className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Firebase no está configurado. Usá la clave demo para acceder
                    al panel (por defecto: <code className="text-amber-400">viandapp-master</code>).
                  </p>
                  <label className="block">
                    <span className="text-xs text-slate-400">Clave admin</span>
                    <input
                      type="password"
                      className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm outline-none focus:border-amber-400"
                      value={demoKey}
                      onChange={(e) => setDemoKey(e.target.value)}
                      required
                    />
                  </label>
                  {error && <p className="text-xs text-rose-400">{error}</p>}
                  <button
                    type="submit"
                    className="w-full min-h-11 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                  >
                    Entrar al panel
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-700 px-3 py-2 sm:px-4">
              <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
                      tab === id
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2.5">
                <Database className="h-4 w-4 text-amber-400" />
                <p className="flex-1 text-xs text-slate-400">
                  Cargar datos semilla (LYG, GYL + 10 platos + menús semanales)
                </p>
                <button
                  type="button"
                  onClick={handleSeed}
                  className="min-h-9 rounded-lg bg-slate-700 px-3 text-xs font-semibold text-amber-300 hover:bg-slate-600"
                >
                  Seed
                </button>
                {seedMsg && (
                  <span className="w-full text-xs text-emerald-400">{seedMsg}</span>
                )}
              </div>

              {tab === 'dishes' && (
                <DishesTab
                  dishes={catalog.dishes}
                  onCreate={catalog.addDish}
                  onDelete={catalog.removeDish}
                />
              )}
              {tab === 'menus' && (
                <MenuConfigTab
                  companies={catalog.companies}
                  dishes={catalog.dishes}
                  getMenuFor={catalog.getMenuFor}
                  onSave={catalog.updateMenu}
                />
              )}
              {tab === 'companies' && (
                <CompaniesTab
                  companies={catalog.companies}
                  onCreate={catalog.addCompany}
                />
              )}
              {tab === 'report' && (
                <ConsolidatedTab
                  orders={catalog.orders}
                  companies={catalog.companies}
                  dishesById={catalog.dishesById}
                  companiesById={catalog.companiesById}
                />
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
