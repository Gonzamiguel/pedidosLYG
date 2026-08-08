import { Building2, Phone, User, MapPin } from 'lucide-react'
import { OTHER_DELIVERY_PLACE } from '../data/constants'

export default function ClientForm({
  company,
  value,
  onChange,
  errors = {},
  deliveryPlaces = [],
}) {
  const field =
    'mt-1.5 w-full min-h-12 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-bordo-400 focus:ring-2 focus:ring-bordo-200'

  const isOther = value.deliveryPlaceId === OTHER_DELIVERY_PLACE

  const setPlace = (placeId) => {
    if (placeId === OTHER_DELIVERY_PLACE) {
      onChange({
        ...value,
        deliveryPlaceId: OTHER_DELIVERY_PLACE,
        userSector: value.deliveryPlaceOther || '',
      })
      return
    }
    const place = deliveryPlaces.find((p) => p.id === placeId)
    onChange({
      ...value,
      deliveryPlaceId: placeId,
      deliveryPlaceOther: '',
      userSector: place?.name || '',
    })
  }

  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        Tus datos
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Para identificar el pedido de tu empresa.
      </p>

      <div className="mt-3.5 grid gap-3.5">
        <div className="rounded-xl border border-bordo-200 bg-bordo-50 px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-bordo-800">
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
          <div className="block">
            <label className="block">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400" />
                Lugar de entrega
              </span>
              <select
                className={field}
                value={value.deliveryPlaceId || ''}
                onChange={(e) => setPlace(e.target.value)}
              >
                <option value="">Seleccioná un lugar</option>
                {deliveryPlaces.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
                <option value={OTHER_DELIVERY_PLACE}>Otro</option>
              </select>
            </label>

            {isOther && (
              <label className="mt-2 block">
                <span className="text-sm font-medium text-slate-700">
                  ¿Dónde querés la entrega?
                </span>
                <input
                  type="text"
                  className={field}
                  placeholder="Escribí el lugar"
                  value={value.deliveryPlaceOther || ''}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      deliveryPlaceOther: e.target.value,
                      userSector: e.target.value,
                    })
                  }
                />
              </label>
            )}

            {errors.userSector && (
              <span className="mt-1 block text-xs text-rose-600">
                {errors.userSector}
              </span>
            )}
          </div>

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
