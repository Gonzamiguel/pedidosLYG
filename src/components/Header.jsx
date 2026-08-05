import { ChefHat, Shield } from 'lucide-react'
import { ORDER_DEADLINE } from '../data/constants'
import { isPastDeadline } from '../utils/orderHelpers'
import { getDataMode } from '../firebase/services'

export default function Header({ onOpenAdmin }) {
  const past = isPastDeadline()
  const mode = getDataMode()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-sm">
            <ChefHat className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              ViandApp
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Pedidos semanales · Almuerzo y Cena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`hidden items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold sm:flex ${
              past
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 animate-pulse-soft'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            }`}
            title="Horario límite de envío diario"
          >
            Límite {ORDER_DEADLINE.label}
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-amber-400 transition hover:bg-slate-800"
            aria-label="Abrir panel Master Admin"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Master</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-stone-50/90 px-4 py-1.5 sm:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs">
          <span
            className={`font-semibold ${past ? 'text-rose-600' : 'text-emerald-700'}`}
          >
            Límite diario: {ORDER_DEADLINE.label}
          </span>
          <span className="text-slate-400">
            {mode === 'local' ? 'Modo demo local' : 'Firebase'}
          </span>
        </div>
      </div>
    </header>
  )
}
