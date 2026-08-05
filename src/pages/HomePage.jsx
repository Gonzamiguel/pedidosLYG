import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME } from '../data/brand'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Cada empresa tiene su propio link de pedidos. Pedile al administrador
          el enlace de tu empresa.
        </p>

        <Link
          to="/admin"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-800 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <Shield className="h-4 w-4" />
          Ingreso administrador
        </Link>
      </div>
    </div>
  )
}
