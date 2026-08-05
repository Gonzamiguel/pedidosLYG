import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME } from '../data/brand'
import { ORDER_DEADLINE } from '../data/constants'
import { isPastDeadline } from '../utils/orderHelpers'

export default function Header({ company }) {
  const past = isPastDeadline()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 safe-pt sm:px-4 sm:py-3">
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-xl">
            {APP_NAME}
          </h1>
          <p className="truncate text-[11px] text-slate-500 sm:text-sm">
            {company
              ? `${company.code} · Almuerzo y Cena`
              : 'Almuerzo y Cena · Lun a Dom'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            className={`rounded-md px-2 py-1.5 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${
              past
                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                : 'bg-stone-100 text-slate-700 ring-1 ring-stone-200'
            }`}
            title="Horario límite de envío diario"
          >
            <span className="sm:hidden">Límite {ORDER_DEADLINE.label}</span>
            <span className="hidden sm:inline">Límite {ORDER_DEADLINE.label}</span>
          </div>

          <Link
            to="/admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700 transition hover:bg-stone-50 sm:h-11 sm:w-auto sm:gap-2 sm:px-3"
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
