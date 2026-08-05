import { DAYS } from '../data/constants'
import { countDayMeals } from '../utils/orderHelpers'

export default function DayTabs({ activeDay, onChange, details }) {
  return (
    <div className="sticky top-[57px] z-20 -mx-3 border-y border-slate-200/70 bg-stone-100/95 px-3 py-2 backdrop-blur-md sm:top-[68px] sm:-mx-4 sm:px-4">
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              className={`relative flex h-12 min-w-[3.25rem] shrink-0 flex-col items-center justify-center rounded-xl px-2.5 text-xs font-bold transition sm:h-11 sm:min-w-0 sm:flex-row sm:gap-2 sm:px-3.5 sm:text-sm ${
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 active:bg-stone-50'
              }`}
            >
              <span>{day.short}</span>
              {count > 0 && (
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-md px-1 py-0.5 text-[10px] font-bold sm:text-[11px] ${
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
