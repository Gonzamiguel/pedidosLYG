import { useEffect, useState } from 'react'
import {
  Building2,
  ClipboardList,
  Database,
  Lock,
  LogOut,
  Utensils,
  X,
  CalendarRange,
  Loader2,
} from 'lucide-react'
import { ADMIN_DEMO_KEY, isFirebaseConfigured } from '../firebase/config'
import {
  loginAdmin,
  logoutAdmin,
  subscribeAdminAuth,
} from '../firebase/auth'
import { getDataMode } from '../firebase/services'
import DishesTab from './admin/DishesTab'
import MenuConfigTab from './admin/MenuConfigTab'
import CompaniesTab from './admin/CompaniesTab'
import ConsolidatedTab from './admin/ConsolidatedTab'

const TABS = [
  { id: 'dishes', label: 'Platos', short: 'Platos', icon: Utensils },
  { id: 'menus', label: 'Menú', short: 'Menú', icon: CalendarRange },
  { id: 'companies', label: 'Empresas', short: 'Emp.', icon: Building2 },
  { id: 'report', label: 'Cocina', short: 'Cocina', icon: ClipboardList },
]

export default function MasterPanel({ open, onClose, catalog }) {
  const [tab, setTab] = useState('dishes')
  const [admin, setAdmin] = useState(null)
  const [demoAuthed, setDemoAuthed] = useState(false)
  const [checking, setChecking] = useState(isFirebaseConfigured)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [demoKey, setDemoKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  const authed = Boolean(admin) || demoAuthed

  useEffect(() => {
    if (!open) return undefined
    if (!isFirebaseConfigured) {
      setChecking(false)
      return undefined
    }

    setChecking(true)
    const unsub = subscribeAdminAuth((profile) => {
      setAdmin(profile)
      setChecking(false)
    })
    return unsub
  }, [open])

  if (!open) return null

  const loginFirebase = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const profile = await loginAdmin(email, password)
      setAdmin(profile)
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos')
      } else if (code === 'auth/user-not-found') {
        setError('Usuario no encontrado en Authentication')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Probá más tarde.')
      } else {
        setError(err.message || 'Error de autenticación')
      }
    } finally {
      setBusy(false)
    }
  }

  const loginDemo = (e) => {
    e.preventDefault()
    if (demoKey.trim() === ADMIN_DEMO_KEY) {
      setDemoAuthed(true)
      setError('')
    } else {
      setError('Clave incorrecta')
    }
  }

  const logout = async () => {
    if (admin) await logoutAdmin()
    setAdmin(null)
    setDemoAuthed(false)
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
      <aside className="relative z-10 flex h-dvh w-full max-w-3xl flex-col bg-slate-900 text-slate-100 shadow-2xl animate-fade-up sm:max-h-none">
        <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-3 safe-pt sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Admin
            </p>
            <h2 className="truncate font-display text-lg font-bold text-white sm:text-xl">
              Panel de Administración
            </h2>
            <p className="truncate text-xs text-slate-400">
              {admin
                ? admin.email
                : getDataMode() === 'local'
                  ? 'Modo demo local'
                  : 'Firebase Auth + role admin'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {authed && (
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-slate-800 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">Salir</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {checking ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificando sesión…
          </div>
        ) : !authed ? (
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-4 sm:p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-amber-400">
                <Lock className="h-5 w-5" />
                <h3 className="font-semibold">Ingreso administrador</h3>
              </div>

              {isFirebaseConfigured ? (
                <form onSubmit={loginFirebase} className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Ingresá con el usuario de Firebase Authentication que tenga
                    documento en <code className="text-amber-400">users</code>{' '}
                    con <code className="text-amber-400">role: &quot;admin&quot;</code>.
                  </p>
                  <label className="block">
                    <span className="text-xs text-slate-400">Email</span>
                    <input
                      type="email"
                      autoComplete="username"
                      inputMode="email"
                      className="mt-1 w-full min-h-12 rounded-xl border border-slate-600 bg-slate-900 px-3 text-base outline-none focus:border-amber-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-400">Contraseña</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      className="mt-1 w-full min-h-12 rounded-xl border border-slate-600 bg-slate-900 px-3 text-base outline-none focus:border-amber-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>
                  {error && (
                    <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Iniciar sesión
                  </button>
                </form>
              ) : (
                <form onSubmit={loginDemo} className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Firebase no está configurado. Clave demo:{' '}
                    <code className="text-amber-400">viandapp-master</code>
                  </p>
                  <label className="block">
                    <span className="text-xs text-slate-400">Clave admin</span>
                    <input
                      type="password"
                      className="mt-1 w-full min-h-12 rounded-xl border border-slate-600 bg-slate-900 px-3 text-base outline-none focus:border-amber-400"
                      value={demoKey}
                      onChange={(e) => setDemoKey(e.target.value)}
                      required
                    />
                  </label>
                  {error && <p className="text-sm text-rose-400">{error}</p>}
                  <button
                    type="submit"
                    className="w-full min-h-12 rounded-xl bg-amber-500 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                  >
                    Entrar al panel
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-700 px-2 py-2 sm:px-4">
              <div
                className="grid grid-cols-4 gap-1"
                role="tablist"
                aria-label="Secciones admin"
              >
                {TABS.map(({ id, label, short, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold transition sm:flex-row sm:gap-1.5 sm:text-sm ${
                      tab === id
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 safe-pb sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2.5">
                <Database className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="min-w-0 flex-1 text-xs text-slate-400">
                  Seed: LYG, GYL + 10 platos + menús
                </p>
                <button
                  type="button"
                  onClick={handleSeed}
                  className="min-h-10 rounded-lg bg-slate-700 px-3 text-xs font-semibold text-amber-300 hover:bg-slate-600"
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
