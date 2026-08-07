import { Moon, Sun } from 'lucide-react'
import { MEAL_SLOTS } from '../data/constants'
import QuantitySelector from './QuantitySelector'

const TAG_STYLES = {
  Tradicional: 'bg-lg-100 text-lg-700',
  'Saludable / Veggie': 'bg-bordo-50 text-bordo-700',
  'Light / Sin TACC': 'bg-lg-50 text-lg-600',
  Especial: 'bg-bordo-100 text-bordo-800',
}

export default function MenuCard({
  slot,
  dishIds = [],
  dishesById,
  quantities = {},
  onQuantityChange,
}) {
  const meta = MEAL_SLOTS[slot]
  const isLunch = slot === 'lunch'

  const shell = isLunch
    ? 'border-bordo-200 bg-bordo-50/70'
    : 'border-lg-200 bg-lg-100/70'

  const title = isLunch ? 'text-bordo-800' : 'text-lg-800'
  const Icon = isLunch ? Sun : Moon

  return (
    <section className={`animate-fade-up rounded-2xl border p-3.5 sm:p-5 ${shell}`}>
      <div className="mb-3">
        <h3 className={`flex items-center gap-2 text-base font-semibold sm:text-lg ${title}`}>
          <Icon className="h-5 w-5" />
          {meta.label}
        </h3>
      </div>

      {!dishIds.length ? (
        <p className="rounded-xl bg-white/70 px-3 py-4 text-sm text-slate-500 ring-1 ring-slate-200/60">
          Sin platos para este turno. Pedile al admin que configure el menú.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {dishIds.map((dishId) => {
            const dish = dishesById[dishId]
            if (!dish) return null
            return (
              <li
                key={dishId}
                className="rounded-xl bg-white/95 p-3 ring-1 ring-black/5"
              >
                <div className="flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-snug text-slate-900">
                      {dish.name}
                    </p>
                    {dish.tag ? (
                      <span
                        className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          TAG_STYLES[dish.tag] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dish.tag}
                      </span>
                    ) : null}
                    {dish.desc ? (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                        {dish.desc}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-end">
                    <QuantitySelector
                      value={quantities[dishId] || 0}
                      onChange={(n) => onQuantityChange(dishId, n)}
                      tone={meta.tone}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
