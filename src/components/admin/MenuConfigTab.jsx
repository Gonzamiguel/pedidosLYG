import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { DAYS, MAX_DISHES_PER_SLOT } from '../../data/constants'

export default function MenuConfigTab({
  companies,
  dishes,
  getMenuFor,
  onSave,
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [dayId, setDayId] = useState('lun')
  const [lunch, setLunch] = useState([])
  const [dinner, setDinner] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  useEffect(() => {
    if (!companyId) return
    const menu = getMenuFor(companyId, dayId)
    setLunch(menu.lunch || [])
    setDinner(menu.dinner || [])
    setMsg('')
  }, [companyId, dayId, getMenuFor])

  const toggle = (slot, dishId) => {
    const setter = slot === 'lunch' ? setLunch : setDinner
    const current = slot === 'lunch' ? lunch : dinner
    if (current.includes(dishId)) {
      setter(current.filter((id) => id !== dishId))
      return
    }
    if (current.length >= MAX_DISHES_PER_SLOT) {
      setMsg(`Máximo ${MAX_DISHES_PER_SLOT} platos por turno`)
      return
    }
    setter([...current, dishId])
    setMsg('')
  }

  const save = async () => {
    if (!companyId) return
    setBusy(true)
    setMsg('')
    try {
      await onSave({ companyId, dayId, lunch, dinner })
      setMsg('Menú guardado')
    } catch (err) {
      setMsg(err.message || 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const SlotPicker = ({ title, slot, selected, tone }) => (
    <div
      className={`rounded-xl border p-3 ${
        tone === 'lunch'
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-indigo-500/30 bg-indigo-500/5'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4
          className={`text-sm font-semibold ${
            tone === 'lunch' ? 'text-amber-400' : 'text-indigo-300'
          }`}
        >
          {title}
        </h4>
        <span className="text-xs text-slate-400">
          {selected.length}/{MAX_DISHES_PER_SLOT}
        </span>
      </div>
      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {dishes.map((dish) => {
          const checked = selected.includes(dish.id)
          return (
            <li key={dish.id}>
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition ${
                  checked
                    ? 'bg-slate-700/80 ring-1 ring-amber-400/40'
                    : 'hover:bg-slate-800/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(slot, dish.id)}
                  className="h-4 w-4 accent-amber-400"
                />
                <span className="text-sm text-slate-200">
                  {dish.name}
                  <span className="ml-2 text-xs text-slate-500">{dish.tag}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-slate-400">Empresa</span>
          <select
            className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">Día</span>
          <select
            className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
            value={dayId}
            onChange={(e) => setDayId(e.target.value)}
          >
            {DAYS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SlotPicker title="Almuerzo" slot="lunch" selected={lunch} tone="lunch" />
        <SlotPicker title="Cena" slot="dinner" selected={dinner} tone="dinner" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !companyId}
          onClick={save}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Guardar menú
        </button>
        {msg && <p className="text-sm text-slate-300">{msg}</p>}
      </div>
    </div>
  )
}
