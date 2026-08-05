import { Link } from 'react-router-dom'
import { ChefHat, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-white to-amber-50/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white">
          <ChefHat className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900">
          Pedidos L&G
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cada empresa tiene su propio link de pedidos. Pedile al administrador
          el enlace de tu empresa.
        </p>

        <Link
          to="/admin"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <Shield className="h-4 w-4" />
          Ingreso administrador
        </Link>
      </div>
    </div>
  )
}
