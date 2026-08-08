import { Building2, Moon, Phone, Sun, User, MapPin } from 'lucide-react'
import { OTHER_DELIVERY_PLACE } from '../data/constants'

const field =
  'mt-1.5 w-full min-h-12 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-bordo-400 focus:ring-2 focus:ring-bordo-200'

function PlacePicker({
  label,
  icon: Icon,
  tone,
  placeId,
  placeOther,
  deliveryPlaces,
  onPlaceIdChange,
  onPlaceOtherChange,
  error,
}) {
  const isOther = placeId === OTHER_DELIVERY_PLACE
  const shell =
    tone === 'lunch'
      ? 'border-bordo-200 bg-bordo-50/50'
      : 'border-lg-200 bg-lg-50'

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${shell}`}>
      <label className="block">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </span>
        <select
          className={field}
          value={placeId || ''}
          onChange={(e) => onPlaceIdChange(e.target.value)}
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
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <MapPin className="h-4 w-4 text-slate-400" />
            ¿Dónde querés la entrega?
          </span>
          <input
            type="text"
            className={field}
            placeholder="Escribí el lugar"
            value={placeOther || ''}
            onChange={(e) => onPlaceOtherChange(e.target.value)}
          />
        </label>
      )}

      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </div>
  )
}

export default function ClientForm({
  company,
  value,
  onChange,
  errors = {},
  deliveryPlaces = [],
}) {
  const setLunchPlace = (placeId) => {
    if (placeId === OTHER_DELIVERY_PLACE) {
      onChange({
        ...value,
        deliveryPlaceLunchId: OTHER_DELIVERY_PLACE,
      })
      return
    }
    onChange({
      ...value,
      deliveryPlaceLunchId: placeId,
      deliveryPlaceLunchOther: '',
    })
  }

  const setDinnerPlace = (placeId) => {
    if (placeId === OTHER_DELIVERY_PLACE) {
      onChange({
        ...value,
        deliveryPlaceDinnerId: OTHER_DELIVERY_PLACE,
      })
      return
    }
    onChange({
      ...value,
      deliveryPlaceDinnerId: placeId,
      deliveryPlaceDinnerOther: '',
    })
  }

  return (
    <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        Tus datos
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Indicá dónde entregamos el almuerzo y la cena.
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

        <div className="grid gap-3.5 sm:grid-cols-2">
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
              <span className="mt-1 block text-xs text-rose-600">
                {errors.userName}
              </span>
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
              onChange={(e) =>
                onChange({ ...value, userPhone: e.target.value })
              }
            />
            {errors.userPhone && (
              <span className="mt-1 block text-xs text-rose-600">
                {errors.userPhone}
              </span>
            )}
          </label>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <PlacePicker
            label="Entrega almuerzo"
            icon={Sun}
            tone="lunch"
            placeId={value.deliveryPlaceLunchId}
            placeOther={value.deliveryPlaceLunchOther}
            deliveryPlaces={deliveryPlaces}
            onPlaceIdChange={setLunchPlace}
            onPlaceOtherChange={(text) =>
              onChange({ ...value, deliveryPlaceLunchOther: text })
            }
            error={errors.deliveryPlaceLunch}
          />
          <PlacePicker
            label="Entrega cena"
            icon={Moon}
            tone="dinner"
            placeId={value.deliveryPlaceDinnerId}
            placeOther={value.deliveryPlaceDinnerOther}
            deliveryPlaces={deliveryPlaces}
            onPlaceIdChange={setDinnerPlace}
            onPlaceOtherChange={(text) =>
              onChange({ ...value, deliveryPlaceDinnerOther: text })
            }
            error={errors.deliveryPlaceDinner}
          />
        </div>
      </div>
    </section>
  )
}
