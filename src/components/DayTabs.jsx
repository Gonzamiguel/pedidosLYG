import { DAYS } from '../data/constants'
import { countDayMeals } from '../utils/orderHelpers'

export default function DayTabs({ activeDay, onChange, details }) {
  return (
    <div className="sticky top-[73px] z-20 -mx-4 border-y border-slate-200/70 bg-stone-100/95 px-4 py-2 backdrop-blur-md sm:top-[68px]">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Días de la semana"
      >
        {DAYS.map((day) => {
          const count = countDayMeals(details?.[day.id])
          const active = activeDay === day.id
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(day.id)}
              className={`relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-stone-50'
              }`}
            >
              <span className="sm:hidden">{day.short}</span>
              <span className="hidden sm:inline">{day.label}</span>
              {count > 0 && (
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    active
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
