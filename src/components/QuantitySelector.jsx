import { Minus, Plus } from 'lucide-react'

export default function QuantitySelector({ value, onChange, tone = 'lunch' }) {
  const btnTone =
    tone === 'dinner'
      ? 'bg-indigo-100 text-indigo-800 active:bg-indigo-300'
      : 'bg-amber-100 text-amber-800 active:bg-amber-300'

  const inputTone =
    tone === 'dinner'
      ? 'border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200'
      : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'

  const bump = (delta) => {
    onChange(Math.max(0, (Number(value) || 0) + delta))
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => bump(-1)}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition active:scale-95 ${btnTone}`}
      >
        <Minus className="h-5 w-5" strokeWidth={2.5} />
      </button>

      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={0}
        max={999}
        className={`hide-arrows h-12 w-[4.25rem] rounded-xl border bg-white text-center text-lg font-bold text-slate-800 outline-none focus:ring-2 ${inputTone}`}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') {
            onChange(0)
            return
          }
          onChange(Number(raw))
        }}
        onBlur={() => {
          if (!value) onChange(0)
        }}
      />

      <button
        type="button"
        aria-label="Sumar"
        onClick={() => bump(1)}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition active:scale-95 ${btnTone}`}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}
