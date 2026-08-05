import { Link } from 'react-router-dom'
import { ChefHat, Shield } from 'lucide-react'
import { ORDER_DEADLINE } from '../data/constants'
import { isPastDeadline } from '../utils/orderHelpers'

export default function Header({ company }) {
  const past = isPastDeadline()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 safe-pt sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm sm:h-11 sm:w-11">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
              Pedidos L&G
            </h1>
            <p className="truncate text-[11px] text-slate-500 sm:text-sm">
              {company
                ? `${company.code} · Almuerzo y Cena`
                : 'Almuerzo y Cena · Lun a Dom'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            className={`rounded-lg px-2 py-1.5 text-[11px] font-bold sm:px-2.5 sm:text-xs ${
              past
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 animate-pulse-soft'
                : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
            }`}
            title="Horario límite de envío diario"
          >
            <span className="sm:hidden">⏱ {ORDER_DEADLINE.label}</span>
            <span className="hidden sm:inline">Límite {ORDER_DEADLINE.label}</span>
          </div>

          <Link
            to="/admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-amber-700 transition hover:bg-amber-50 sm:h-11 sm:w-auto sm:gap-2 sm:px-3"
            aria-label="Ingreso administrador"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden text-sm font-semibold sm:inline">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
