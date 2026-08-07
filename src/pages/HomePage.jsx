import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME } from '../data/brand'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-lg-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-lg-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-bordo-800 sm:text-3xl">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-lg-600">
          Pedile al administrador el link del formulario de pedidos de tu
          empresa.
        </p>

        <Link
          to="/admin"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-bordo-700 text-sm font-semibold text-white hover:bg-bordo-800"
        >
          <Shield className="h-4 w-4" />
          Ingreso administrador
        </Link>
      </div>
    </div>
  )
}
