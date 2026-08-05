import { Building2, Phone, User, MapPin } from 'lucide-react'

export default function ClientForm({ companies, value, onChange, errors = {} }) {
  const field =
    'mt-1.5 w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200'

  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Datos del solicitante
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Completá tus datos para identificar el pedido.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Building2 className="h-4 w-4 text-slate-400" />
            Empresa
          </span>
          <select
            className={field}
            value={value.companyId}
            onChange={(e) => onChange({ ...value, companyId: e.target.value })}
          >
            <option value="">Seleccionar empresa…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <span className="mt-1 block text-xs text-rose-600">{errors.companyId}</span>
          )}
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <User className="h-4 w-4 text-slate-400" />
            Nombre y Apellido
          </span>
          <input
            type="text"
            autoComplete="name"
            className={field}
            placeholder="Ej: Ana Gómez"
            value={value.userName}
            onChange={(e) => onChange({ ...value, userName: e.target.value })}
          />
          {errors.userName && (
            <span className="mt-1 block text-xs text-rose-600">{errors.userName}</span>
          )}
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <MapPin className="h-4 w-4 text-slate-400" />
            Sector / Área / Sucursal
          </span>
          <input
            type="text"
            className={field}
            placeholder="Ej: Mantenimiento"
            value={value.userSector}
            onChange={(e) => onChange({ ...value, userSector: e.target.value })}
          />
          {errors.userSector && (
            <span className="mt-1 block text-xs text-rose-600">{errors.userSector}</span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            Teléfono / WhatsApp
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={field}
            placeholder="Ej: 11 2345 6789"
            value={value.userPhone}
            onChange={(e) => onChange({ ...value, userPhone: e.target.value })}
          />
          {errors.userPhone && (
            <span className="mt-1 block text-xs text-rose-600">{errors.userPhone}</span>
          )}
        </label>
      </div>
    </section>
  )
}
