import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'
import { ADMIN_DEMO_KEY, isFirebaseConfigured } from '../firebase/config'
import {
  loginAdmin,
  logoutAdmin,
  subscribeAdminAuth,
} from '../firebase/auth'
import { APP_NAME } from '../data/brand'
import { getDataMode } from '../firebase/services'
import ConsolidatedModule from './admin/ConsolidatedModule'
import DayMenuModule from './admin/DayMenuModule'
import FormsModule from './admin/FormsModule'
import ConfigModule from './admin/ConfigModule'

const MODULES = [
  {
    id: 'day-menu',
    label: 'Menú del día',
    description: 'Totales a preparar y quién pidió',
    icon: UtensilsCrossed,
  },
  {
    id: 'consolidated',
    label: 'Consolidado',
    description: 'Todos los pedidos + export Excel',
    icon: ClipboardList,
  },
  {
    id: 'forms',
    label: 'Formularios',
    description: 'Generar links por empresa y fechas',
    icon: FileText,
  },
  {
    id: 'config',
    label: 'Configuración',
    description: 'Empresas y platos',
    icon: Settings,
  },
]

const inputClass =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

export default function AdminDashboard({ onBack, catalog }) {
  const [module, setModule] = useState('day-menu')
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
    return subscribeAdminAuth((profile) => {
      setAdmin(profile)
      setChecking(false)
    })
  }, [])

  const loginFirebase = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      setAdmin(await loginAdmin(email, password))
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos')
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
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Verificando sesión…
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-100 px-4">
        <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-slate-700">
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
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Contraseña
                </span>
                <input
                  type="password"
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
                className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-bordo-700 text-sm font-semibold text-white hover:bg-bordo-800 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Iniciar sesión
              </button>
            </form>
          ) : (
            <form onSubmit={loginDemo} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Clave admin
                </span>
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
                className="w-full min-h-11 rounded-lg bg-bordo-700 text-sm font-semibold text-white hover:bg-bordo-800"
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
      <aside className="sticky top-0 flex h-dvh w-72 shrink-0 flex-col border-r border-stone-200 bg-white">
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
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${
                  active
                    ? 'bg-bordo-700 text-white'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    active ? 'text-bordo-200' : 'text-slate-400'
                  }`}
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span
                    className={`block text-xs ${
                      active ? 'text-bordo-100' : 'text-slate-500'
                    }`}
                  >
                    {description}
                  </span>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-8 py-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Módulo
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {current.label}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">{current.description}</p>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-6xl">
            {module === 'day-menu' && (
              <DayMenuModule
                orders={catalog.orders}
                companies={catalog.companies}
                companiesById={catalog.companiesById}
                formsById={catalog.formsById}
                dishesById={catalog.dishesById}
              />
            )}
            {module === 'consolidated' && (
              <ConsolidatedModule
                orders={catalog.orders}
                companies={catalog.companies}
                companiesById={catalog.companiesById}
                formsById={catalog.formsById}
                dishesById={catalog.dishesById}
              />
            )}
            {module === 'forms' && <FormsModule catalog={catalog} />}
            {module === 'config' && <ConfigModule catalog={catalog} />}
          </div>
        </main>
      </div>
    </div>
  )
}
