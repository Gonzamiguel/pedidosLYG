import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  History,
  Loader2,
  Lock,
  LogOut,
  Utensils,
} from 'lucide-react'
import { ADMIN_DEMO_KEY, isFirebaseConfigured } from '../firebase/config'
import {
  loginAdmin,
  logoutAdmin,
  subscribeAdminAuth,
} from '../firebase/auth'
import { APP_NAME } from '../data/brand'
import { getDataMode } from '../firebase/services'
import DishesTab from './admin/DishesTab'
import MenuConfigTab from './admin/MenuConfigTab'
import CompaniesTab from './admin/CompaniesTab'
import WeeksTab from './admin/WeeksTab'
import ConsolidatedTab from './admin/ConsolidatedTab'
import HistoryTab from './admin/HistoryTab'

const MODULES = [
  {
    id: 'companies',
    label: 'Empresas',
    description: 'Links y altas',
    icon: Building2,
  },
  {
    id: 'weeks',
    label: 'Semanas',
    description: 'Período del pedido',
    icon: CalendarDays,
  },
  {
    id: 'dishes',
    label: 'Platos',
    description: 'Catálogo central',
    icon: Utensils,
  },
  {
    id: 'menus',
    label: 'Configurar menú',
    description: 'Por empresa y día',
    icon: CalendarRange,
  },
  {
    id: 'report',
    label: 'Consolidado cocina',
    description: 'Pedidos de la semana',
    icon: ClipboardList,
  },
  {
    id: 'history',
    label: 'Historial',
    description: 'Semanas y pedidos',
    icon: History,
  },
]

const inputClass =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function AdminDashboard({ onBack, catalog }) {
  const [module, setModule] = useState('weeks')
  const [admin, setAdmin] = useState(null)
  const [demoAuthed, setDemoAuthed] = useState(false)
  const [checking, setChecking] = useState(isFirebaseConfigured)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [demoKey, setDemoKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const authed = Boolean(admin) || demoAuthed
  const current = MODULES.find((m) => m.id === module) || MODULES[0]

  useEffect(() => {
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
  }, [])

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

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-100 text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-600" />
        Verificando sesión…
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-stone-100 via-white to-amber-50/40 px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al pedido
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {APP_NAME}
              </p>
              <p className="text-sm text-slate-500">Acceso administrador</p>
            </div>
          </div>

          {isFirebaseConfigured ? (
            <form onSubmit={loginFirebase} className="space-y-4">
              <p className="text-sm text-slate-600">
                Ingresá con tu usuario de Firebase que tenga{' '}
                <code className="rounded bg-amber-50 px-1 text-amber-800">
                  role: &quot;admin&quot;
                </code>{' '}
                en la colección <code className="rounded bg-stone-100 px-1">users</code>.
              </p>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Contraseña</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Iniciar sesión
              </button>
            </form>
          ) : (
            <form onSubmit={loginDemo} className="space-y-4">
              <p className="text-sm text-slate-600">
                Firebase no configurado. Clave demo:{' '}
                <code className="rounded bg-amber-50 px-1 text-amber-800">
                  viandapp-master
                </code>
              </p>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Clave admin</span>
                <input
                  type="password"
                  className={inputClass}
                  value={demoKey}
                  onChange={(e) => setDemoKey(e.target.value)}
                  required
                />
              </label>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full min-h-11 rounded-lg bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600"
              >
                Entrar
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-stone-100 text-slate-800">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-5">
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
            {APP_NAME}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            Administración
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Módulos">
          {MODULES.map(({ id, label, description, icon: Icon }) => {
            const active = module === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setModule(id)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                  active
                    ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    active ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-slate-500">{description}</span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-2 border-t border-stone-200 p-3">
          <p className="truncate px-1 text-xs text-slate-500">
            {admin?.email || `Modo ${getDataMode()}`}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-stone-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al inicio
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-8 py-5 backdrop-blur">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Módulo
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {current.label}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">{current.description}</p>
            </div>
            <div className="rounded-lg bg-stone-50 px-3 py-2 text-right text-xs text-slate-500 ring-1 ring-stone-200">
              <p className="font-medium text-slate-700">Escritorio</p>
              <p>{getDataMode() === 'firebase' ? 'Firebase conectado' : 'Demo local'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-6xl">
            {module === 'companies' && (
              <CompaniesTab
                companies={catalog.companies}
                onCreate={catalog.addCompany}
                onDelete={catalog.removeCompany}
              />
            )}
            {module === 'weeks' && (
              <WeeksTab
                companies={catalog.companies}
                weeks={catalog.weeks}
                onCreate={catalog.addWeek}
                onSetStatus={catalog.changeWeekStatus}
                onDelete={catalog.removeWeek}
              />
            )}
            {module === 'dishes' && (
              <DishesTab
                dishes={catalog.dishes}
                onCreate={catalog.addDish}
                onDelete={catalog.removeDish}
              />
            )}
            {module === 'menus' && (
              <MenuConfigTab
                companies={catalog.companies}
                dishes={catalog.dishes}
                getMenuFor={catalog.getMenuFor}
                onSave={catalog.updateMenu}
              />
            )}
            {module === 'report' && (
              <ConsolidatedTab
                orders={catalog.orders}
                weeks={catalog.weeks}
                companies={catalog.companies}
                dishesById={catalog.dishesById}
                companiesById={catalog.companiesById}
              />
            )}
            {module === 'history' && (
              <HistoryTab
                orders={catalog.orders}
                weeks={catalog.weeks}
                companies={catalog.companies}
                companiesById={catalog.companiesById}
                weeksById={catalog.weeksById}
                dishesById={catalog.dishesById}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
