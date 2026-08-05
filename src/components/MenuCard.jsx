import { Moon, Sun, MessageSquareText } from 'lucide-react'
import { MEAL_SLOTS } from '../data/constants'
import QuantitySelector from './QuantitySelector'

const TAG_STYLES = {
  Tradicional: 'bg-stone-100 text-stone-700',
  'Saludable / Veggie': 'bg-emerald-50 text-emerald-700',
  'Light / Sin TACC': 'bg-sky-50 text-sky-700',
  Especial: 'bg-violet-50 text-violet-700',
}

export default function MenuCard({
  slot,
  dishIds = [],
  dishesById,
  quantities = {},
  note = '',
  onQuantityChange,
  onNoteChange,
}) {
  const meta = MEAL_SLOTS[slot]
  const isLunch = slot === 'lunch'

  const shell = isLunch
    ? 'border-amber-200 bg-amber-50/70'
    : 'border-indigo-200 bg-indigo-50/70'

  const title = isLunch ? 'text-amber-800' : 'text-indigo-800'
  const schedule = isLunch ? 'text-amber-700/80' : 'text-indigo-700/80'
  const Icon = isLunch ? Sun : Moon

  return (
    <section className={`animate-fade-up rounded-2xl border p-3.5 sm:p-5 ${shell}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className={`flex items-center gap-2 font-display text-base font-semibold sm:text-lg ${title}`}>
            <Icon className="h-5 w-5" />
            {meta.label}
          </h3>
          <p className={`mt-0.5 text-xs sm:text-sm ${schedule}`}>{meta.schedule}</p>
        </div>
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[15px] font-semibold leading-snug text-slate-900">
                        {dish.name}
                      </p>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          TAG_STYLES[dish.tag] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dish.tag}
                      </span>
                    </div>
                    {dish.desc && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                        {dish.desc}
                      </p>
                    )}
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

      <label className="mt-3.5 block">
        <span className={`mb-1.5 flex items-center gap-1.5 text-sm font-medium ${title}`}>
          <MessageSquareText className="h-4 w-4" />
          Aclaraciones
        </span>
        <textarea
          rows={2}
          className={`w-full rounded-xl border bg-white/90 px-3 py-3 text-base text-slate-800 outline-none transition focus:ring-2 ${
            isLunch
              ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
              : 'border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200'
          }`}
          placeholder='Ej: "1 sin sal, 3 para Mantenimiento"'
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </label>
    </section>
  )
}
