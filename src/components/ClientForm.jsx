import { Building2, Phone, User, MapPin } from 'lucide-react'

export default function ClientForm({ company, value, onChange, errors = {} }) {
  const field =
    'mt-1.5 w-full min-h-12 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200'

  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-semibold text-slate-900 sm:text-lg">
        Tus datos
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Para identificar el pedido de tu empresa.
      </p>

      <div className="mt-3.5 grid gap-3.5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
            <Building2 className="h-4 w-4" />
            Empresa
          </span>
          <p className="mt-1 font-semibold text-slate-900">
            {company?.code} — {company?.name}
          </p>
        </div>

        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <User className="h-4 w-4 text-slate-400" />
            Nombre y Apellido
          </span>
          <input
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            className={field}
            placeholder="Ej: Ana Gómez"
            value={value.userName}
            onChange={(e) => onChange({ ...value, userName: e.target.value })}
          />
          {errors.userName && (
            <span className="mt-1 block text-xs text-rose-600">{errors.userName}</span>
          )}
        </label>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400" />
              Sector / Área
            </span>
            <input
              type="text"
              enterKeyHint="next"
              className={field}
              placeholder="Ej: Mantenimiento"
              value={value.userSector}
              onChange={(e) => onChange({ ...value, userSector: e.target.value })}
            />
            {errors.userSector && (
              <span className="mt-1 block text-xs text-rose-600">{errors.userSector}</span>
            )}
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" />
              WhatsApp
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="done"
              className={field}
              placeholder="11 2345 6789"
              value={value.userPhone}
              onChange={(e) => onChange({ ...value, userPhone: e.target.value })}
            />
            {errors.userPhone && (
              <span className="mt-1 block text-xs text-rose-600">{errors.userPhone}</span>
            )}
          </label>
        </div>
      </div>
    </section>
  )
}
